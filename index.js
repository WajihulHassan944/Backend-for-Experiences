const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const { ObjectId } = require('mongodb');
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);

const cors = require("cors");
app.use(cors());
app.use(express.json());


const players = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('ready', () => {
    players.push(socket.id);

    if (players.length === 2) {
      io.emit('start');
    }
  });

  socket.on('update', (data) => {
    // Handle game updates and broadcast to other players
    socket.broadcast.emit('update', data);
  });

  socket.on('disconnect', () => {
    const index = players.indexOf(socket.id);
    if (index !== -1) {
      players.splice(index, 1);
      io.emit('playerLeft', socket.id);
    }
    console.log('A user disconnected:', socket.id);
  });
});


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/care-alliance";
const PORT = process.env.PORT || 3000;
const MYPASSWORD = process.env.MYPASSWORD;
// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const experienceSchema = new mongoose.Schema({
  name:String,
  title: String,
  content: String,
  location: String,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Experience = mongoose.model('Experience', experienceSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const User = new mongoose.model("User", userSchema);


const cakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  date: Date,
  description: String,
});
const Cake = mongoose.model("Cake", cakeSchema);
app.post('/users/:objectId/cakes', async (req, res) => {
  const { objectId } = req.params;
  const { title, date, description } = req.body;

  try {
    const user = await User.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cake = new Cake({
      userId: objectId,
      title,
      date,
      description,
    });

    await cake.save();
    res.status(200).json({ message: 'Data submitted successfully', cake });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
// ... (same code as before)

app.get('/users/:objectId/cakes', async (req, res) => {
  const { objectId } = req.params;

  try {
    const user = await User.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cakes = await Cake.find({ userId: objectId });
    res.status(200).json(cakes);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/cakes/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received DELETE request for cake ID:', id);
  try {
    const cake = await Cake.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const objectId = user._id.toString();
        res.status(200).json({ message: 'Login successful', objectId: objectId });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword, // Store the hashed password in the database
      });

      await newUser.save();
      res.status(200).json({ message: 'Registration successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/users/:objectId', async (req, res) => {
  const { objectId } = req.params;

  try {
    const user = await User.findById(objectId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /experiences route handler
app.post('/experiences', async (req, res) => {
  try {
    const experience = new Experience({
        name: req.body.name,
        title: req.body.title,
      content: req.body.content,
      location: req.body.location,
      category: req.body.category,
    });

    await experience.save();

    res.status(201).json({
      success: true,
      message: 'Experience saved successfully.',
      experience: experience,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to save experience.',
      error: error,
    });
  }
});

app.get('/experiences', async (req, res) => {
    try {
      const experiences = await Experience.find();
      res.json(experiences);
    } catch (error) {
      alert(error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch experiences.',
        error: error,
      });
    }
  });

  
app.get('/experiences/:key', async (req, res) => {
  try {
    const searchQuery = req.params.key;
    const searchRegex = new RegExp(searchQuery, 'i');
    const results = await Experience.find({
      $or: [
        { name: searchRegex },
        { title: searchRegex },
        { content: searchRegex },
        { location: searchRegex },
        { category: searchRegex }
      ]
    }).exec();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an experience
app.put('/experiences/:id', async (req, res) => {
  const { id } = req.params;
  const { name, title, content, location, category } = req.body;

  try {
    const updatedExperience = await Experience.findByIdAndUpdate(id, {
      name: name,
      title: title,
      content: content,
      location: location,
      category: category
    }, { new: true });

    res.json(updatedExperience);
  } catch (error) {
    console.error('Error updating experience', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an experience
app.delete('/experiences/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Experience.findByIdAndDelete(id);

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/submit-order", (req, res) => {
  // Extract the form data from the request body
  const { itemName, userName, userAddress , userEmail , phone , shipping , tshirtType , quantity , tshirtSize , imageUrl} = req.body;

  // Send an email with the form details using Nodemailer or your preferred email library
  // Here's an example using Nodemailer
  const nodemailer = require("nodemailer");

// Create a transporter object for sending the email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vascularbundle43@gmail.com',
    pass: 'gxauudkzvdvhdzbg',
  },
});

const storeMailOptions = {
  from: userEmail,
  to: "vascularbundle43@gmail.com",
  subject: "New T-shirt Order",
  html: `
    <h2 style="color: #ff523b;">New T-shirt Order</h2>
    <hr style="border: 1px solid #ccc;">
    <img src="${imageUrl}" alt="Product Image" style="max-width: 250px; padding:10px; background-color:#f5f1ee;margin:15px 0;">
    <p><strong>Item:</strong> ${itemName}</p>
    <p><strong>User Name:</strong> ${userName}</p>
    <p><strong>User Address:</strong> ${userAddress}</p>
    <p><strong>User Phone Number:</strong> ${phone}</p>
    <p><strong>User Email:</strong> ${userEmail}</p>
    <p><strong>Shipping:</strong> ${shipping}</p>
    <p><strong>T-shirt Type:</strong> ${tshirtType}</p>
    <p><strong>T-shirt Size:</strong> ${tshirtSize}</p>
    <p><strong>Quantity:</strong> ${quantity}</p>
  `,
};

const userMailOptions = {
  from: "wajih786hassan@gmail.com",
  to: userEmail,
  subject: "Thank you for placing the order",
  html: `
    <h2 style="color: #00a86b;">Thank you for placing the order</h2>
    <p>Hello ${userName},</p>
    <p>We appreciate your order and will begin processing it soon.</p>
    <h3>Your Order Details:</h3>
    <img src="${imageUrl}" alt="Product Image" style="max-width: 250px; padding:10px; background-color:#f5f1ee;margin:15px 0;">
    <p><strong>Ordered Item:</strong> ${itemName}</p>
    <p><strong>Your Address:</strong> ${userAddress}</p>
    <p><strong>Phone Number:</strong> ${phone}</p>
    <p><strong>Shipping:</strong> ${shipping}</p>
    <p><strong>T-shirt Type:</strong> ${tshirtType}</p>
    <p><strong>T-shirt Size:</strong> ${tshirtSize}</p>
    <p><strong>Quantity:</strong> ${quantity}</p>
    <p>If you have any questions or concerns, feel free to contact us.</p>
    <p>Thank you again for choosing our store!</p>
  `,
};

// Send the email to the store
transporter.sendMail(storeMailOptions, function(error, storeInfo) {
  if (error) {
    console.error(error);
    res.status(500).send("Error sending email to store");
  } else {
    console.log("Email sent to store: " + storeInfo.response);

    // Send the email to the user
    transporter.sendMail(userMailOptions, function(error, userInfo) {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email to user");
      } else {
        console.log("Email sent to user: " + userInfo.response);
        res.status(200).send("Order submitted successfully");
      }
    });
  }
});

});





app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  
  app.get("/", (req,res) =>{
      res.send("Backend server has started running successfully...");
  });

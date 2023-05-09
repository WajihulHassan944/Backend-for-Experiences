const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();


const cors = require("cors");
app.use(cors());
app.use(express.json());


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/care-alliance";
const PORT = process.env.PORT || 3000;

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



app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  
  app.get("/", (req,res) =>{
      res.send("hello");
  })

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');



const cors = require("cors");
app.use(cors());
app.use(express.json());
const app = express();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/care-alliance";
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const experienceSchema = new mongoose.Schema({
  title: String,
  content: String,
  fileUrl: String,
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
      title: req.body.title,
      content: req.body.content,
      fileUrl: req.body.fileUrl,
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

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  
  app.get("/", (req,res) =>{
      res.send("hello");
  })

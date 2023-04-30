const express = require('express');
const cors = require('cors');
const app = express();const mongoose = require('mongoose');
app.use(cors());
app.use(express.json());
const path = require('path');
const uploadDir = path.join(__dirname, 'uploads');
// Connect to MongoDB database



const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/experiences";
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Define experience schemaconst mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
      location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  timePeriod: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  audio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }
});

// Define experience model
const Experience = mongoose.model('Experience', experienceSchema);

// Submit a new experience
app.post('/experiences', async (req, res) => {
  try {
    const { name, location, category, timePeriod, experience, media } = req.body;
    const newExperience = new Experience({
      name,
      location,
      category,
      timePeriod,
      experience,
      media
    });
    const result = await newExperience.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error submitting experience:', error);
    res.status(500).json({ message: 'Error submitting experience' });
  }
});

// Get all experiences
app.get('/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.json(experiences);
  } catch (error) {
    console.error('Error getting experiences:', error);
    res.status(500).json({ message: 'Error getting experiences' });
  }
});


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  
  app.get("/", (req,res) =>{
      res.send("hello");
  })
  

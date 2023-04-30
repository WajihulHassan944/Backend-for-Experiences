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
const experiences = [];

// Route for submitting a new experience
app.post('/experiences', (req, res) => {
  const { location, category, timePeriod, experience } = req.body;

  const newExperience = {
    id: experiences.length + 1,
    location,
    category,
    timePeriod,
    experience,
    media: []
  };

  experiences.push(newExperience);
  experiences.save()
  .then(() => {
    res.send({ message: 'Event created successfully' });
  })
  .catch((err) => {
    res.status(500).send({ error: err });
  });

  res.status(201).json({ id: newExperience.id });
});

// Route for uploading media files for an experience
app.post('/experiences/:id/media', (req, res) => {
  const id = parseInt(req.params.id);
  const experience = experiences.find(e => e.id === id);

  if (!experience) {
    return res.status(404).json({ error: 'Experience not found' });
  }

  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const media = [];

    for (const file of Object.values(files)) {
      media.push({
        filename: file.name,
        type: file.type,
        path: file.path
      });
    }

    experience.media.push(...media);
media.save();
    res.status(201).json({ success: true });
  });
});

// Route for getting all experiences
app.get('/experiences', (req, res) => {
  res.json(experiences);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});  app.get("/", (req,res) =>{
      res.send("hello");
  })
  

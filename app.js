
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs'); 
const { body, validationResult } = require('express-validator');
const indexRoutes = require('./routes/index');
const uploadRoutes = require('./routes/upload');

const app = express();

const mongoURI = 'mongodb+srv://test1:test1@cluster0.hzssffo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const photoSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String
});
const Photo = mongoose.model('Photo', photoSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());  
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/images', express.static(path.join(__dirname, 'public/images')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/'); 
  },
  filename: (req, file, cb) => {   
    cb(null, Date.now() + path.extname(file.originalname));  
  }
});
const upload = multer({ storage });

app.use('/', indexRoutes(Photo)); 
app.use('/upload', uploadRoutes(Photo, upload, body, validationResult)); 

//pic deletion
app.post('/delete/:id', async (req, res) => {
  try {
    const photoId = req.params.id;

    
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    // Delete
    const filePath = path.join(__dirname, 'public/images', photo.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
        return res.status(500).send('Failed to delete file');
      }
      console.log('File successfully deleted');
    });

    await Photo.findByIdAndDelete(photoId);

    
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).send('Server error');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

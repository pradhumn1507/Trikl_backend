
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();
const fs = require('fs'); 
require('dotenv').config();

// Configure CORS to allow cross-origin requests
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the image model
const imageSchema = new mongoose.Schema({
  imageUrl: String,
});

const Image = mongoose.model('Image', imageSchema);


const uploadsDir = path.join("/", 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

app.get('/',(req,res)=>{
  res.send('ok');
})

// Define routes for image upload and retrieval
app.post( '/upload', upload.single('image'), async (req, res) => {
  
    try {
      const imageUrl = req.file.filename;
  
      const image = new Image({ imageUrl });
      await image.save();
  
      // Send a success message to the client
      res.json({ message: 'Image successfully uploaded', imageUrl });
    
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Image upload failed' });
    }
  });
  

app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).json({ error: 'Error retrieving images' });
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

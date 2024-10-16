import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from "fs"
// import dotenv from 'dotenv';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// dotenv.config();

const app = express();
const PORT = 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads', // Ensure this directory exists
  filename: (req, file, cb) => {
    cb(null, `upload_image.jpg`);
  },
});

const upload = multer({ storage });

// Endpoint to upload images
app.post('/upload', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  console.log("uploff")
  const msg = req.body.optionalText
  const fileManager = new GoogleAIFileManager("AIzaSyAf5n2Q-Ig5Nn-LUHLl8QVfbvyRHB4Kx8I"); // Use API key from environment

  try {
    // Upload image to Google Generative AI service
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: 'image/jpeg',
      displayName: 'Uploaded Image',
    });

    // Use the Gemini AI model
    const genAI = new GoogleGenerativeAI("AIzaSyAf5n2Q-Ig5Nn-LUHLl8QVfbvyRHB4Kx8I");
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const input = msg ? msg : " Give a brief info about this image "
    const result = await model.generateContent([
      input,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    // Send response back to frontend
    // res.json({ message: result.response.text() });
    // Send response back to frontend
const cleanResponse = result.response.text().replace(/\*\*/g, ''); // Remove asterisks
res.json({ message: cleanResponse });

    console.log(result.response.text())
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

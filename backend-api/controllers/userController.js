// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path'); // Import the path module
const axios = require('axios');
const FormData = require('form-data');

async function extract_ktp_info(imagePath) {
  try {
    const form = new FormData();
    form.append('ktp_image', fs.createReadStream(imagePath));

    const response = await axios.post('https://ocr-model-ft45chovnq-et.a.run.app/extract', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    return response.data; // Assuming response.data is JSON containing NIK and Name
  } catch (error) {
    throw new Error(`Failed to extract KTP info: ${error.message}`);
  }
}

async function extract_face_info(imagePath) {
  try {
    const form = new FormData();
    form.append('face_image', fs.createReadStream(imagePath));

    const response = await axios.post('https://face-recognition-model-ft45chovnq-et.a.run.app/extract-face', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    return response.data; // Assuming response.data is JSON containing NIK and Name
  } catch (error) {
    throw new Error(`Failed to extract KTP info: ${error.message}`);
  }
}

exports.register = async (req, res) => {

  const { email, password } = req.body;
    
  const ktpImage = req.files['ktp_image'] ? req.files['ktp_image'][0] : null;
  const faceImage = req.files['face_image'] ? req.files['face_image'][0] : null;
    
  if (!ktpImage || !faceImage) {
      return res.status(400).send('Both images are required.');
  }

  // Generate a unique temporary file path
  const uploadsDir = path.join(__dirname, '../temp_data');
  const ktpDir = path.join(uploadsDir, '/ktp-images');
  const ktp_tempPath = path.join(ktpDir, `${Date.now()}.png`);
  const faceDir = path.join(uploadsDir, '/face-images');
  const face_tempPath = path.join(faceDir, `${Date.now()}.png`);

  try {
    // Ensure the uploads directory exists
    if (!fs.existsSync(ktpDir)) {
      fs.mkdirSync(ktpDir);
    }else if (!fs.existsSync(faceDir)) {
      fs.mkdirSync(faceDir);
    } 

    // Write the file buffer to a temporary file
    fs.writeFileSync(ktp_tempPath, ktpImage.buffer);
    fs.writeFileSync(face_tempPath, faceImage.buffer);

    const ocrResult = await extract_ktp_info(ktp_tempPath);
    const { nik, name } = ocrResult;
    
    if (!nik || !name) {
      return res.status(400).json({ message: 'Failed to extract NIK or Name from the image, please take photos steadily ' });
    }

    const faceResult = await extract_face_info(face_tempPath);
    const { name_FR } = faceResult;
    
    if (!name_FR) {
      return res.status(400).json({ message: 'Failed to recognize user, please take photos steadily' });
    }
    
    // Clean up the temporary file
    fs.unlinkSync(ktp_tempPath);
    fs.unlinkSync(face_tempPath);
    
    let fixedName = name
    if (name.startsWith('Nama ')) {
      fixedName = name.replace(/^Nama\s/, ''); // Remove the 'Nama ' prefix
    } else if (name.startsWith(' ')) {
      fixedName = name.replace(/\s+/, '');
    }

    if (fixedName != name_FR) {
      return res.status(400).json({ message: 'the face is not the same as the ID photo' });
    }

    // Check if NIK already exists
    const existingUser = await User.findOne({ where: { nik } });
    if (existingUser) {
      return res.status(400).json({ message: 'NIK already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // check the data
    console.log(nik, name, fixedName, email, hashedPassword);
    
    // Create new user
    const newUser = await User.create({ nik, name: fixedName, email, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgetPassword = async (req, res) => {
  const { nik, email, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { nik, email } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewProfile = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findByPk(id, { attributes: ['nik', 'name', 'email'] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
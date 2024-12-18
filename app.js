const express = require('express'); 
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt'); // For password hashing
require('dotenv').config();

const app = express(); 

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Abdulelah:sVN1gECLdkbk8Lcu@apartment.ak29g.mongodb.net/?retryWrites=true&w=majority&appName=Apartment";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Multer for File Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Mongoose Schemas and Models
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Encrypted password
    name: { type: String, required: true },
    phone: { type: String, required: true },
    photo: { type: String }, 
    birthdate: { type: Date },
    gender: { type: String }
});

const ExpenseSchema = new mongoose.Schema({
    email: String,
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// Root Route - Serve login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Register User
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ 
            email, 
            password: hashedPassword, 
            name, 
            phone 
        });
        await newUser.save();

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login User
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Profile
app.post('/api/profile', upload.single('photo'), async (req, res) => {
    try {
        const { email, name, phone, birthdate, gender } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.birthdate = birthdate || user.birthdate;
        user.gender = gender || user.gender;
        if (req.file) user.photo = `/uploads/${req.file.filename}`;

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch Profile Data
app.get('/api/get-profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const totalExpenses = await Expense.aggregate([
            { $match: { email } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({
            name: user.name,
            phone: user.phone,
            birthdate: user.birthdate,
            gender: user.gender,
            photo: user.photo || null,
            totalExpenses: totalExpenses[0]?.total || 0
        });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update Account (Change Email and Password)
app.post('/api/update-account', async (req, res) => {
    try {
        const { email, newEmail, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (newEmail) user.email = newEmail;
        if (password) user.password = await bcrypt.hash(password, 10); // Hash new password

        await user.save();
        res.json({ message: 'Account updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
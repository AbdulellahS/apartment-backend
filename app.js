const express = require('express'); // Require express first
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "YOUR_MONGODB_CONNECTION_STRING";
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
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    birthdate: { type: Date },
    gender: { type: String },
    photo: { type: String } // Path to photo if uploaded
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

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, name, phone });
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

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

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

        // Validate incoming data
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update user fields
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.birthdate = birthdate || user.birthdate;
        user.gender = gender || user.gender;
        if (req.file) user.photo = `/uploads/${req.file.filename}`;

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error.message);
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

        const expenses = await Expense.find({ email });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        res.json({
            name: user.name,
            phone: user.phone,
            birthdate: user.birthdate,
            gender: user.gender,
            photo: user.photo || 'default-avatar.png', // Default if no photo
            totalExpenses
        });
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add Expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { email, amount, description } = req.body;

        if (!email || !amount || !description) {
            return res.status(400).json({ error: 'Email, amount, and description are required.' });
        }

        const newExpense = new Expense({ email, amount, description });
        await newExpense.save();

        res.json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        console.error('Error adding expense:', error.message);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// Get User-Specific Expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const { email } = req.query;
        const expenses = await Expense.find({ email });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
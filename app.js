const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
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
    .then(() => console.log('MongoDB Atlas connected successfully!'))
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
    password: String,
    name: String,
    phone: String,
    photo: { type: String, default: '' }
});

const ExpenseSchema = new mongoose.Schema({
    email: String,
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// Register User
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const newUser = new User({ email, password, name, phone });
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
        const user = await User.findOne({ email, password });

        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Profile
app.post('/api/profile', upload.single('photo'), async (req, res) => {
    try {
        const { email, name, phone } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });

        user.name = name || user.name;
        user.phone = phone || user.phone;
        if (req.file) user.photo = `/uploads/${req.file.filename}`;

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { email, amount, description } = req.body;
        const newExpense = new Expense({ email, amount, description });

        await newExpense.save();
        res.json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// Get All Expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Update Expense
app.put('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid expense ID' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            { description, amount },
            { new: true }
        );

        if (!updatedExpense) return res.status(404).json({ error: 'Expense not found' });

        res.json({ message: 'Expense updated successfully', expense: updatedExpense });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// Delete Expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid expense ID' });
        }

        const deletedExpense = await Expense.findByIdAndDelete(id);

        if (!deletedExpense) return res.status(404).json({ error: 'Expense not found' });

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
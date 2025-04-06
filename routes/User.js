// const { Router } = require('express');
// const User = require('../models/user');
// const router = Router();


// router.post('/register', async (req, res) => {
//     const { fullName, enamil, password, role } = req.body
//     try {
//         await User.create(fullName, enamil, password, role);
//         res.json({ message: 'User created successfully' });
//         return res.redirect("/");
//     } catch (error) {
//         res.json({ message: 'Error creating user', error });
//     }

// })

// // router.post('/login', async (req, res) => {
// //     const { email, password } = req.body;
// //     try {
// //         const token = await User.matchPasswordAndGenerateToken(email, password);
// //         console.log(token);
// //         res.json({ message: 'Login successful', token });
// //         return res.redirect("/");

// //     } catch (error) {

// //     }
// // })

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt'); // You'll need to install this
const jwt = require('jsonwebtoken'); // You'll need to install this

// User registration
router.post('/register', async (req, res) => {
    const { fullName, email, password, role } = req.body;
    
    // Validation
    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role
        });
        
        await newUser.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    
    // Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check if role matches
        if (role && user.role !== role) {
            return res.status(401).json({ message: 'Invalid role for this user' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );
        
        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });
        
        res.status(200).json({ 
            message: 'Login successful',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
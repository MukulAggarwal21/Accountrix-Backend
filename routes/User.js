const { Router } = require('express');
const User = require('../models/user');

app.post('/register', async (req, res) => {
    const { fullName, enamil, password, role } = req.body
    try {
        await User.create(fullName, enamil, password, role);
        res.json({ message: 'User created successfully' });
    } catch (error) {
        res.json({ message: 'Error creating user', error });
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        console.log(token);
        res.json({ message: 'Login successful', token });

    } catch (error) {

    }
})
// const {Schema , model} = require('mongoose')
// const mongoose = require('mongoose')

// const userSchema = new Schema({
//     fullName: {
//         type: String,
//         required: true,
//     },

//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },

//     password: {
//         type: String,
//         required: true,
//     },

//     role: {
//         type: String,
//         required: true,
//         enum: ['recruiter', 'student'],
//     }
// })

// const User = model("user", userSchema)

// module.exports = User


const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['recruiter', 'student']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to match password and generate token
userSchema.statics.matchPasswordAndGenerateToken = async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    
    // Generate token
    const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
    );
    
    return { token, user };
};

const User = model("user", userSchema);

module.exports = User;
const {Schema , model} = require('mongoose')
const mongoose = require('mongoose')

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true,
        enum: ['recruiter', 'student'],
    }
})

const User = model("user", userSchema)

module.exports = User
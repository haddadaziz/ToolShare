const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['ADMIN', 'MANAGER', 'USER'],
        default: 'USER',
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)

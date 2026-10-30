const mongoose = require('mongoose')

const toolSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['DISPONIBLE', 'INDISPONIBLE', 'HORS_SERVICE'],
        default: 'DISPONIBLE',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Tool', toolSchema)

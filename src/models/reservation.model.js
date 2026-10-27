const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
    {
        toolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Equipment',
            required: true,
            index: true
        },
        borrowerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        durationHours: {
            type: Number,
            required: true,
            min: [1, 'la duree minimal de reservation est de 1heure']
        },
        status: {
            type: String,
            enum: ['CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'],
            default: 'CONFIRMEE',
            required: true,
            index: true
        },
        actualStartDate: {
            type: Date,
            default: null
        },
        actualEndDate: {
            type: Date,
            default: null
        },
        checkedOutByManagerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        checkedInByManagerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        returnCondition: {
            type: String,
            enum: ['BON', 'ENDOMMAGE'],
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Reservation', reservationSchema)
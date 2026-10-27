const User = require('../models/user.model');

async function create(userData, session = null) {
    const user = new User(userData);
    return await user.save({ session });
}

function findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+password');
}

function findById(id) {
    return User.findById(id);
}

function getAllUsers() {
    return User.find({});
}

function countUsers() {
    return User.countDocuments();
}

function desactive(id, status) {
    return User.findByIdAndUpdate(id, { isActive: status }, { new: true });
}

async function update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
}

module.exports = { create, countUsers, findByEmailWithPassword, findById, getAllUsers, desactive, update };

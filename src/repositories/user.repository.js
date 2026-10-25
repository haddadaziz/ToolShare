const User = require('../models/user.model')

async function create(userData,session = null) {
    const user = new User(userData);
    return await user.save({session});
}

function findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+password')
}

function findById(id) {
    return User.findById(id)
}

module.exports = { create, findByEmailWithPassword, findById }

const User = require('../models/user.model')

function create(userData) {
    return User.create(userData)
}

function findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+password')
}

function findById(id) {
    return User.findById(id)
}
function getAllUsers() {
    return User.find({})
}

function countUsers() {
  return User.countDocuments()
}

function desactive(id,status) {
    return User.findByIdAndUpdate({_id:id},{isActive:status})
}

module.exports = { create, countUsers,findByEmailWithPassword, findById, getAllUsers, desactive }

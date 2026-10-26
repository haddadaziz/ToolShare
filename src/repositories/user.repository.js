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
function getAllUsers() {
    return User.find({})
}

<<<<<<< HEAD
function countUsers() {
  return User.countDocuments()
}

function desactive(id,status) {
    return User.findByIdAndUpdate({_id:id},{isActive:status})
}

module.exports = { create, countUsers,findByEmailWithPassword, findById, getAllUsers, desactive }
=======
async function update(id,updateData){
    return await User.findByIdAndUpdate(id,updateData,{new:true ,runValidators:true});
}

module.exports = { create, findByEmailWithPassword, findById ,update}
>>>>>>> 6e574988dfd7539cfaa92c6515561055bede75cf

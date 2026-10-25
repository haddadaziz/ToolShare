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

async function update(id,updateData){
    return await User.findByIdAndUpdate(id,updateData,{new:true ,runValidators:true});
}

module.exports = { create, findByEmailWithPassword, findById ,update}

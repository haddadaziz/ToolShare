const bcrypt = require('bcryptjs')
const AppError = require('../utils/appError');

const userRepository = require('../repositories/user.repository')
const { signToken } = require('../utils/jwt.util')

function toPublicUser(user) {
    let storeId = null
    if (user.storeId) {
        storeId = user.storeId.toString()
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: storeId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}
async function getAllUsers() {
    const users = await userRepository.getAllUsers()
    return users.map(toPublicUser)
}

async function register(data) {
    const name = data.name
    const email = data.email
    const password = data.password
    let role = data.role || 'USER'
    const IsFirstUser = (await userRepository.countUsers()) === 0;
  
     if (IsFirstUser) { role = "ADMIN" }
    
    if (!name || name.trim() === '') {
       
        throw new AppError('Le nom est obligatoire.',400)
    }

  if (!email || !email.includes('@') || !email.includes('.')) {
    throw new AppError('Une adresse e-mail valide est obligatoire.',400)
 
    }

    if (!password || password.length < 8) {
      
      throw new AppError('Le mot de passe doit contenir au moins 8 caractères.',400)

    }

    const cleanEmail = email.trim().toLowerCase()



    const existingUser = await userRepository.findByEmailWithPassword(cleanEmail)
  if (existingUser) {
   
        throw new AppError('Cette adresse e-mail est déjà utilisée.',400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userRepository.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role
    })

    const token = signToken(user._id.toString())
    return {
        token: token,
        user: toPublicUser(user)
    }
}

async function login(data) {
    const email = data.email
    const password = data.password

  if (!email || !password) {
    throw new AppError('Identifiants invalides.',401)

    }

    const cleanEmail = email.trim().toLowerCase()
    const user = await userRepository.findByEmailWithPassword(cleanEmail)

  if (!user ) {
    throw new AppError('Identifiants invalides.',401)

    }
  if ( !user.isActive) {
    throw new AppError('You are not active !! .',401)

    }
    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    if (!passwordIsCorrect) {
      throw new AppError('Identifiants invalides.',401)

    }

    const token = signToken(user._id.toString())
    return {
        token: token,
        user: toPublicUser(user)
    }
}



module.exports = { register, login, toPublicUser, getAllUsers }
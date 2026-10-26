const authService = require('../services/auth.service')
const userRepository = require('../repositories/user.repository')

// const { authenticate } = require('../middlewares/auth.middleware');
const AppError = require('../utils/appError')

async function register(req, res, next) {
  const IsFirstUser = (await userRepository.countUsers()) === 0;
if(!IsFirstUser){
  const currentUserRole = req.user?.role;
  
 if(!currentUserRole)  return next(new AppError("login first !!", 403));
  if (currentUserRole === 'USER') {
    return next(new AppError("you can't create account only manager or admin !!!", 403));
  }
  if (currentUserRole === 'MANAGER' && (req.body.role === 'MANAGER' || req.body.role === 'ADMIN')) {
    return next(new AppError("you can't create Manager or admin ! .admin only !", 403));

  }
}
    const result = await authService.register(req.body, req.user)
    res.status(201).json(result)
}

async function login(req, res) {
    const result = await authService.login(req.body)
    res.json(result)
}

function getMe(req, res) {
    res.json({ user: req.user })
}

async function getAllUsers(req, res) {
    const result = await authService.getAllUsers()
    return res.status(200).json(result)

}

async function desactive(req,res) {
  const result = await userRepository.desactive(req.params.id, req.body.isActive);
  return res.status(200).json(result)
}

module.exports = { register, login, getMe, getAllUsers, desactive }

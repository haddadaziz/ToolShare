const installationService = require('../services/installation.service');
const AppError = require('../utils/appError');
class InstallationController{
    async getStatus(req,res,next){
        try{
            const status = await installationService.checkInstallationStatus();

            res.status(200).json(status)
        }catch(error){
            next(error);
        }
    }

    async install(req,res,next){
        try{
            const {name,email,password} = req.body

            if (!name || !email || !password) {
                throw new AppError('Tous les champs sont obligatoires',400);
            }
            
            const result = await installationService.installApp({name,email,password});

            res.status(201).json({message: 'application installée avec succes',data:result})
        }catch(error){
            next(error)
        }
    }
}

module.exports = new InstallationController();
const installationService = require('../services/installation.service');

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
                const error
            }
        }
    }
}
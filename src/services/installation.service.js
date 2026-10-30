const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/user.repository');
const installationRepository = require('../repositories/installation.repository');

class InstallationService {
    async checkInstallationStatus() {
        const installation = await installationRepository.getInstallation();
        if (!installation || !installation.isInstalled) return { isInstalled: false }

        return { isInstalled: true, installedAt: installation.installedAt }
    }

    async installApp(data) {
        const { name, email, password } = data;

        const existingInstall = await installationRepository.getInstallation();
        if (existingInstall && existingInstall.isInstalled) {
            const error = new Error('The application is already installed; reinstalling is not allowed')
            error.statusCode = 400
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const admin = await UserRepository.create({
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',

            }, session)
            const installation = await installationRepository.createInstallation({
                isInstalled:true,
                installedByAdminId:admin._id,
                installedAt: new Date()
            },session)
            await session.commitTransaction();

            return{
                admin:{
                    id:admin._id,
                    name:admin.name,
                    email:admin.email,
                    role:admin.role
                },
                installedAt: installation.installedAt
            }
        }catch(error){
            await session.abortTransaction();
            throw error;
        }finally{
            session.endSession();
        }
    }
}

module.exports = new InstallationService();
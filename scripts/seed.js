const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()

const connectDB = require('../src/config/db')
const Reservation = require('../src/models/reservation.model')
const Store = require('../src/models/store.model')
const Tool = require('../src/models/tool.model')
const User = require('../src/models/user.model')

const storeData = [
    {
        name: 'ToolShare Demo - Centre',
        address: '10 Rue de la Republique, Paris',
        site: 'Paris Centre'
    },
    {
        name: 'ToolShare Demo - Nord',
        address: '25 Avenue du Nord, Lille',
        site: 'Lille Nord'
    }
]

const userData = [
    {
        name: 'Demo Admin',
        email: 'admin@example.test',
        password: 'Admin123!',
        role: 'ADMIN'
    },
    {
        name: 'Demo Manager',
        email: 'manager@example.test',
        password: 'Manager123!',
        role: 'MANAGER',
        storeName: 'ToolShare Demo - Centre'
    },
    {
        name: 'Demo User',
        email: 'user@example.test',
        password: 'User123!',
        role: 'USER'
    }
]

const toolData = [
    {
        reference: 'DEMO-DRILL-001',
        name: 'Perceuse sans fil',
        description: 'Perceuse 18V avec deux batteries.',
        status: 'DISPONIBLE',
        storeName: 'ToolShare Demo - Centre'
    },
    {
        reference: 'DEMO-SAW-001',
        name: 'Scie circulaire',
        description: 'Scie circulaire pour bois.',
        status: 'INDISPONIBLE',
        storeName: 'ToolShare Demo - Centre'
    },
    {
        reference: 'DEMO-SANDER-001',
        name: 'Ponceuse orbitale',
        description: 'Ponceuse orbitale electrique.',
        status: 'DISPONIBLE',
        storeName: 'ToolShare Demo - Centre'
    },
    {
        reference: 'DEMO-LADDER-001',
        name: 'Echelle telescopique',
        description: 'Echelle aluminium 3 metres.',
        status: 'DISPONIBLE',
        storeName: 'ToolShare Demo - Nord'
    }
]

async function seed() {
    await connectDB()

    const stores = new Map()
    const users = new Map()
    const tools = new Map()
    for (const data of storeData) {
        const store = await Store.findOneAndUpdate(
            { name: data.name },
            { $set: { ...data, isActive: true } },
            { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
        stores.set(store.name, store)
    }

    for (const data of userData) {
        const password = await bcrypt.hash(data.password, 10)
        const storeId = data.storeName ? stores.get(data.storeName)._id : null
        const user = await User.findOneAndUpdate(
            { email: data.email },
            {
                $set: {
                    name: data.name,
                    password,
                    role: data.role,
                    storeId,
                    isActive: true
                }
            },
            { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
        users.set(data.email, user)
    }

    for (const data of toolData) {
        const storeId = stores.get(data.storeName)._id
        const tool = await Tool.findOneAndUpdate(
            { reference: data.reference },
            {
                $set: {
                    reference: data.reference,
                    name: data.name,
                    description: data.description,
                    status: data.status,
                    storeId,
                    isActive: true
                }
            },
            { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
        tools.set(data.reference, tool)
    }

    const now = new Date()
    const overdueStartDate = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    const overdueEndDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const overdueTool = tools.get('DEMO-SANDER-001')
    await Reservation.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId('64f0f27a0f4e7a1d2b03c001') },
        {
            $set: {
                toolId: overdueTool._id,
                borrowerId: users.get('user@example.test')._id,
                storeId: stores.get('ToolShare Demo - Centre')._id,
                startDate: overdueStartDate,
                endDate: overdueEndDate,
                durationHours: 24,
                status: 'EN_COURS',
                actualStartDate: overdueStartDate,
                actualEndDate: null,
                checkedOutByManagerId: users.get('manager@example.test')._id,
                checkedInByManagerId: null,
                returnCondition: null
            }
        },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
    await Tool.updateOne({ _id: overdueTool._id }, { $set: { status: 'INDISPONIBLE' } })

    console.log(`Seed complete: ${stores.size} stores, ${userData.length} users, ${toolData.length} tools, 1 overdue reservation.`)
}

seed()
    .catch((error) => {
        console.error('Failed to seed demo data:', error)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.disconnect()
    })

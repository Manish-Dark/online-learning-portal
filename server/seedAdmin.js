const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: 'manish1212@gmail.com' });
        if (existingAdmin) {
            existingAdmin.password = 'manish@2004';
            await existingAdmin.save();
            console.log('✅ Admin password updated to plain text');
            return;
        }

        const newAdmin = new Admin({
            name: 'Admin',
            email: 'manish1212@gmail.com',
            password: 'manish@2004'
        });

        await newAdmin.save();
        console.log('✅ Admin created successfully');
    } catch (error) {
        console.error('❌ Error creating/updating admin:', error);
    }
};

module.exports = seedAdmin;

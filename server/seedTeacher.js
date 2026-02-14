const Teacher = require('./models/Teacher');

const seedTeacher = async () => {
    // Default teacher seeding disabled for security
    // try {
    //     const existingTeacher = await Teacher.findOne({ email: 'teacher@gmail.com' });
    //     if (existingTeacher) {
    //         existingTeacher.password = 'teacher@2004';
    //         if (!existingTeacher.course) existingTeacher.course = 'B.Tech';
    //         await existingTeacher.save();
    //         console.log('✅ Teacher password updated to plain text');
    //         return;
    //     }

    //     const newTeacher = new Teacher({
    //         name: 'Teacher',
    //         email: 'teacher@gmail.com',
    //         password: 'teacher@2004',
    //         isApproved: true,
    //         specialization: 'General',
    //         course: 'B.Tech' // Default course for seed teacher
    //     });

    //     await newTeacher.save();
    //     console.log('✅ Teacher created successfully');
    // } catch (error) {
    //     console.error('❌ Error creating teacher:', error);
    // }
    console.log('ℹ️ Teacher seeding skipped');
};

module.exports = seedTeacher;

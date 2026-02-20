const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

let connectionPromise;

const connectDB = () => {
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
            .then(m => {
                console.log('✅ MongoDB Connected via db.js');
                return m.connection.getClient(); // Resolve to MongoClient for GridFsStorage
            })
            .catch(err => {
                console.error('❌ MongoDB Connection Error:', err);
                process.exit(1);
            });
    }
    return connectionPromise;
};

module.exports = connectDB;

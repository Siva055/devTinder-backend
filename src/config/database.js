const mongoose = require("mongoose")
// connecting to mongodb clusters inside it will have multiple databases
const connectDB = async () => {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET)
}

module.exports = connectDB;
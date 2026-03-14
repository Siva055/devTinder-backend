const mongoose = require("mongoose")
// connecting to mongodb clusters inside it will have multiple databases
const connectDB = async () => {
    await mongoose.connect("mongodb+srv://sivasankaransrec19_db_user:iDtoSWgQnfB5UbMh@cluster0.kkph4n2.mongodb.net/?appName=Cluster0")
}

module.exports = connectDB;
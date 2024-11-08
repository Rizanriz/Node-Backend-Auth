const mongoose = require ("mongoose")

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongodb connected");   
        
    } catch (error) {
        console.log("Connection failed");
    }
}

module.exports = connectDB
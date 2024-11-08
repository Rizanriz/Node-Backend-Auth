const express = require ("express")
const connectDB = require("./DB/connectDB")
const dotenv = require("dotenv")
const authRoutes  = require("./routes/authRoutes")

dotenv.config()
const app = express()

app.use(express.json())
app.use("/auth",authRoutes)
const PORT = 5000

connectDB()

app.listen(PORT,()=>{
    console.log(`server running ${PORT}`);
})



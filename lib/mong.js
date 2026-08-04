import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv()

export async function connectDb() {
    const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PWD}@cluster0.kq56grv.mongodb.net/?appName=Cluster0`

    try{
        await mongoose.connect(URI)
        console.log('MongoDB connected')
    }catch(err){
        console.log(err)
    }
}
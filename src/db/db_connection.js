import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try {
        const connectionInstsance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Mongodb connected ! DB Host : ${connectionInstsance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection failed ! ",error);
        process.exit(1);
    }
}

export default connectDB
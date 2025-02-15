import dotenv from "dotenv"
import connectDB from "./db/db_connection.js";

dotenv.config({
    path : './.env'
})


connectDB()
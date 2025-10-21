import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/test", (req,res)=>{
res.send("API is working properly")
})

export default app;

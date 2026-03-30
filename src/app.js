import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import cookieParser from "cookie-parser";

const app = express();
app.use(cors(
    {
        credentials: true,
        origin: "*"
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use("/test", (req, res) => {
    res.send("API is working properly")
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', apiRoutes);

export default app;


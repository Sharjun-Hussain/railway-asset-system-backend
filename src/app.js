import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import assetRoutes from "./routes/assets.js";
import userRoutes from "./routes/users.js";
import aiRoutes from "./routes/ai.js";

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/assets", assetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

export default app;

import mongoose from "mongoose";

const divisionSchema = new mongoose.Schema({
    division_name: { type: String, required: true, unique: true },
    region: { type: String, required: true }, // e.g., "Colombo", "Kandy", "Jaffna"
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Division", divisionSchema);

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    category_name: { type: String, required: true, unique: true },
    is_active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Category", categorySchema);

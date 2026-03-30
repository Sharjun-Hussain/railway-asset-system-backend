import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    qr_code: { type: String, unique: true },
    unit: { type: String, required: true }, // e.g., "pcs", "kg", "meters"
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);

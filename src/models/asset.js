import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    asset_name: { type: String, required: true },
    qr_code: { type: String, required: true, unique: true },
    unit: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Asset", assetSchema);

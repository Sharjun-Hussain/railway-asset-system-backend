import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    sub_category_name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("SubCategory", subCategorySchema);

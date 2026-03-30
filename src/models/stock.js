import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 0 },
    min_level: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one stock record per product per warehouse
stockSchema.index({ warehouseId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Stock", stockSchema);

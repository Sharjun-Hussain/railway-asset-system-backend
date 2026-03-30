import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema({
    transaction_id: { type: String, required: true, unique: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["Receive", "Issue", "Transfer", "Adjustment"], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("StockTransaction", stockTransactionSchema);

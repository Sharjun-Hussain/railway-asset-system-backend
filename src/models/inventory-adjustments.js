import mongoose from "mongoose";

const inventoryAdjustmentSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  adjustmentType: { type: String, required: true }, // increase, decrease, correction
  quantity: { type: Number, required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("InventoryAdjustment", inventoryAdjustmentSchema);

import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  quantity: { type: Number, default: 0 },
  status: { type: String, default: "active" }, // active, faulty, maintenance
  condition: { type: String }, // good, average, poor
  lastMaintenance: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Asset", assetSchema);

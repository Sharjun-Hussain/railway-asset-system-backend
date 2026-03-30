import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
  warehouse_name: { type: String, required: true },
  warehouse_type: { type: String, enum: ["Mechanical", "Signal", "Stationery", "General"], default: "General" },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Warehouse", warehouseSchema);

import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
  warehouse_name: { type: String, required: true },
  warehouse_type: { type: String, enum: ["Mechanical", "Signal", "Stationery", "General"], default: "General" },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  description: { type: String },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

import { syncWarehouseToRAG, removeFromRAG } from "../services/ragSyncService.js";

warehouseSchema.post("save", function (doc) {
  syncWarehouseToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});
warehouseSchema.post("findOneAndUpdate", function (doc) {
  if (doc) syncWarehouseToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});
warehouseSchema.post("findOneAndDelete", function (doc) {
  if (doc) removeFromRAG({ warehouseId: doc._id }).catch(err => console.error("RAG Sync Error:", err));
});

export default mongoose.model("Warehouse", warehouseSchema);

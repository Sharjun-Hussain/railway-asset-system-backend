import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    quantity: { type: Number, default: 0 },
    min_level: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one stock record per asset per warehouse
stockSchema.index({ warehouseId: 1, assetId: 1 }, { unique: true });

import { syncStockToRAG } from "../services/ragSyncService.js";

// Auto-sync to RAG on create/update
stockSchema.post("save", function (doc) {
  syncStockToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

stockSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    syncStockToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
  }
});

export default mongoose.model("Stock", stockSchema);

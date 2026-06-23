import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    quantity: { 
        type: Number, 
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value for quantity'
        }
    },
    min_level: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});


stockSchema.index({ warehouseId: 1, assetId: 1 }, { unique: true });

import { syncStockToRAG, removeFromRAG } from "../services/ragSyncService.js";

stockSchema.post("save", function (doc) {
  syncStockToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

stockSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    if (doc.quantity <= 0) {
      removeFromRAG({ stockId: doc._id });
    } else {
      syncStockToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
    }
  }
});

stockSchema.post("findOneAndDelete", function (doc) {
  if (doc) removeFromRAG({ stockId: doc._id });
});

export default mongoose.model("Stock", stockSchema);

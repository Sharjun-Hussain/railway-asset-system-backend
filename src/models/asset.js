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

import { syncAssetToRAG, removeFromRAG } from "../services/ragSyncService.js";

assetSchema.post("save", function (doc) {
  syncAssetToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

assetSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    syncAssetToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
  }
});

assetSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    removeFromRAG({ relatedAssetId: doc._id }).catch(err => console.error("RAG Sync Error:", err));
  }
});

export default mongoose.model("Asset", assetSchema);

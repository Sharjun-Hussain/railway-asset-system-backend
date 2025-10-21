import mongoose from "mongoose";

const ragKnowledgeSchema = new mongoose.Schema({
  source: { type: String, required: true }, // e.g., "maintenance_manual", "asset_report"
  content: { type: String, required: true },
  embedding: { type: [Number] }, // vector embedding for AI search
  relatedAssetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("RAGKnowledge", ragKnowledgeSchema);

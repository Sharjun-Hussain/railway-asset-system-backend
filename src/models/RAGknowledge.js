import mongoose from "mongoose";

const ragKnowledgeSchema = new mongoose.Schema({
  source: { type: String, required: true }, // e.g., "maintenance_manual", "asset_report"
  content: { type: String, required: true },
  embedding: { type: [Number] }, // vector embedding for AI search
  relatedAssetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
  divisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Division" },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  allowedRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("RAGKnowledge", ragKnowledgeSchema);

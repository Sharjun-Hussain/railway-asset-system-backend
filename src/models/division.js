import mongoose from "mongoose";

const divisionSchema = new mongoose.Schema({
    division_name: { type: String, required: true, unique: true },
    region: { type: String, required: true }, // e.g., "Colombo", "Kandy", "Jaffna"
    is_active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

import { syncDivisionToRAG, removeFromRAG } from "../services/ragSyncService.js";

divisionSchema.post("save", function(doc) {
    syncDivisionToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

divisionSchema.post("findOneAndUpdate", function(doc) {
    if (doc) syncDivisionToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

divisionSchema.post("findOneAndDelete", function(doc) {
    if (doc) removeFromRAG({ divisionId: doc._id }).catch(err => console.error("RAG Sync Error:", err));
});

export default mongoose.model("Division", divisionSchema);

import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
    station_name: { type: String, required: true },
    station_code: { type: String, required: true, unique: true },
    address: { type: String },
    divisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Division", required: true },
    is_active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

import { syncStationToRAG } from "../services/ragSyncService.js";

stationSchema.post("save", function (doc) {
  syncStationToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});
stationSchema.post("findOneAndUpdate", function (doc) {
  if (doc) syncStationToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

export default mongoose.model("Station", stationSchema);

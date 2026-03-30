import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
    station_name: { type: String, required: true },
    station_code: { type: String, required: true, unique: true },
    address: { type: String },
    divisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Division", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Station", stationSchema);

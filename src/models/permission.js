import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "add_asset"
  description: { type: String },         // human-readable description
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Permission", permissionSchema);

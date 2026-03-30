import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "view", "create", "update", "delete"
  module: { type: String, required: true }, // e.g., "stock", "product", "warehouse", "user"
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure a unique combination of name and module
permissionSchema.index({ name: 1, module: 1 }, { unique: true });

export default mongoose.model("Permission", permissionSchema);

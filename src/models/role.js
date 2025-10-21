import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Warehouse Manager", "Staff"
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }, // optional for branch-specific role
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }, // optional for warehouse-specific role
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Role", roleSchema);

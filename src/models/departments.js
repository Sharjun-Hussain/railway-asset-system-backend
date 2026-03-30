import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  code: { type: String },
  name: { type: String, required: true },
  location: { type: String },
  phone_number: { type: String },
  email: { type: String },
  isMainBranch: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Department", departmentSchema);

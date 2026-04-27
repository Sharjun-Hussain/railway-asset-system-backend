import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  divisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Division" },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
  warehouseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }], // Particular warehouse staff
  isActive: { type: Boolean, default: true },
  isPending: { type: Boolean, default: false },
  invitationToken: String,
  invitationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    module: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        index: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    ipAddress: String,
    userAgent: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

export default mongoose.model("AuditLog", auditLogSchema);

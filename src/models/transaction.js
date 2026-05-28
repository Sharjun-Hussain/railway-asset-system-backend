import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true, 
        enum: ["RECEIVE", "ISSUE", "TRANSFER"] 
    },
    assetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Asset", 
        required: true 
    },
    warehouseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Warehouse", 
        required: true 
    },
    toWarehouseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Warehouse", 
        required: false // Only for TRANSFER type
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    referenceNo: { 
        type: String, 
        required: true 
    },
    remarks: { 
        type: String 
    },
    performedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

import { syncTransactionToRAG } from "../services/ragSyncService.js";

// Auto-sync historical transactions to RAG on creation
transactionSchema.post("save", function (doc) {
  syncTransactionToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

export default mongoose.model("Transaction", transactionSchema);

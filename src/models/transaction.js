import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true, 
        enum: ["RECEIVE", "ISSUE", "TRANSFER", "ADJUST"] 
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
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value for quantity'
        }
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

import { syncTransactionToRAG, removeFromRAG } from "../services/ragSyncService.js";

// Auto-sync historical transactions to RAG on creation
transactionSchema.post("save", function (doc) {
  syncTransactionToRAG(doc._id).catch(err => console.error("RAG Sync Error:", err));
});

// Auto-remove from RAG on deletion
transactionSchema.post("findOneAndDelete", function (doc) {
  if (doc) removeFromRAG({ transactionId: doc._id });
});

transactionSchema.post("deleteMany", function () {
  const query = this.getQuery();
  if (query._id) removeFromRAG({ transactionId: query._id });
});

export default mongoose.model("Transaction", transactionSchema);

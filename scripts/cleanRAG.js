import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RAGknowledge from '../src/models/RAGknowledge.js';
import Asset from '../src/models/asset.js';
import Stock from '../src/models/stock.js';
import Transaction from '../src/models/transaction.js';

dotenv.config();

const cleanRAG = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB for RAG cleanup...");

        // 1. Clean orphaned Assets
        const allRAGAssets = await RAGknowledge.find({ source: 'Asset Catalog' });
        let assetCount = 0;
        for (const rag of allRAGAssets) {
            if (rag.relatedAssetId) {
                const exists = await Asset.findById(rag.relatedAssetId);
                if (!exists) {
                    await RAGknowledge.findByIdAndDelete(rag._id);
                    assetCount++;
                }
            }
        }
        console.log(`Removed ${assetCount} orphaned Asset entries from RAG.`);

        // 2. Clean orphaned Stock
        const allRAGStocks = await RAGknowledge.find({ source: 'Warehouse Stock' });
        let stockCount = 0;
        for (const rag of allRAGStocks) {
            if (rag.stockId) {
                const exists = await Stock.findById(rag.stockId);
                if (!exists || exists.quantity <= 0) {
                    await RAGknowledge.findByIdAndDelete(rag._id);
                    stockCount++;
                }
            } else if (rag.relatedAssetId && rag.warehouseId) {
                // Older records without stockId
                const exists = await Stock.findOne({ assetId: rag.relatedAssetId, warehouseId: rag.warehouseId });
                if (!exists || exists.quantity <= 0) {
                    await RAGknowledge.findByIdAndDelete(rag._id);
                    stockCount++;
                }
            }
        }
        console.log(`Removed ${stockCount} orphaned Stock entries from RAG.`);

        // 3. Clean orphaned Transactions
        const allRAGTxns = await RAGknowledge.find({ source: 'Transaction Log' });
        let txnCount = 0;
        for (const rag of allRAGTxns) {
            if (rag.transactionId) {
                const exists = await Transaction.findById(rag.transactionId);
                if (!exists) {
                    await RAGknowledge.findByIdAndDelete(rag._id);
                    txnCount++;
                }
            }
            // Older transaction logs didn't have transactionId, unfortunately we can't accurately verify them
            // unless we delete all of them and re-sync.
        }
        console.log(`Removed ${txnCount} orphaned Transaction entries from RAG.`);

        console.log("Cleanup complete!");
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
};

cleanRAG();

import Stock from "../models/stock.js";
import Transaction from "../models/transaction.js";
import Asset from "../models/asset.js";
import { getAllowedWarehouseIds } from "../utils/rbacUtils.js";

// @desc    Get all stock levels
// @route   GET /api/v1/inventory
export const getStock = async (req, res) => {
    try {
        const warehouseIds = await getAllowedWarehouseIds(req.user);
        const query = warehouseIds ? { warehouseId: { $in: warehouseIds } } : {};

        const stocks = await Stock.find(query)
            .populate("assetId", "asset_name qr_code unit")
            .populate("warehouseId", "warehouse_name location")
            .sort({ updatedAt: -1 });
        
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update stock via transaction (Receive, Issue, Transfer)
// @route   POST /api/v1/inventory/transaction
export const handleTransaction = async (req, res) => {
    const { type, assetId, warehouseId, toWarehouseId, quantity, referenceNo, remarks } = req.body;

    try {
        // 1. Log the transaction
        const transaction = await Transaction.create({
            type,
            assetId,
            warehouseId,
            toWarehouseId,
            quantity,
            referenceNo,
            remarks,
            performedBy: req.user?._id
        });

        // 2. Update Stock Levels
        if (type === "RECEIVE") {
            await Stock.findOneAndUpdate(
                { assetId, warehouseId },
                { $inc: { quantity: quantity }, updatedAt: Date.now() },
                { upsert: true, new: true }
            );
        } else if (type === "ISSUE") {
            const stock = await Stock.findOne({ assetId, warehouseId });
            if (!stock || stock.quantity < quantity) {
                return res.status(400).json({ message: "Insufficient stock level for issue" });
            }
            stock.quantity -= quantity;
            stock.updatedAt = Date.now();
            await stock.save();
        } else if (type === "TRANSFER") {
            // Subtract from source
            const sourceStock = await Stock.findOne({ assetId, warehouseId });
            if (!sourceStock || sourceStock.quantity < quantity) {
                return res.status(400).json({ message: "Insufficient stock at source warehouse" });
            }
            sourceStock.quantity -= quantity;
            sourceStock.updatedAt = Date.now();
            await sourceStock.save();

            // Add to destination
            await Stock.findOneAndUpdate(
                { assetId, warehouseId: toWarehouseId },
                { $inc: { quantity: quantity }, updatedAt: Date.now() },
                { upsert: true, new: true }
            );
        } else if (type === "ADJUST") {
            // For adjustments, we allow both positive and negative quantity changes
            await Stock.findOneAndUpdate(
                { assetId, warehouseId },
                { $inc: { quantity: quantity }, updatedAt: Date.now() },
                { upsert: true, new: true }
            );
        }

        res.status(201).json({ 
            message: "Transaction processed successfully",
            transaction 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get transaction history
// @route   GET /api/v1/transactions
export const getTransactions = async (req, res) => {
    try {
        const warehouseIds = await getAllowedWarehouseIds(req.user);
        const query = warehouseIds ? {
            $or: [
                { warehouseId: { $in: warehouseIds } },
                { toWarehouseId: { $in: warehouseIds } }
            ]
        } : {};

        const transactions = await Transaction.find(query)
            .populate("assetId", "asset_name qr_code")
            .populate("warehouseId", "warehouse_name")
            .populate("toWarehouseId", "warehouse_name")
            .populate("performedBy", "full_name")
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get stock for a specific asset
// @route   GET /api/v1/inventory/asset/:id
export const getAssetStock = async (req, res) => {
    try {
        const warehouseIds = await getAllowedWarehouseIds(req.user);
        const query = { assetId: req.params.id };
        if (warehouseIds) {
            query.warehouseId = { $in: warehouseIds };
        }

        const stocks = await Stock.find(query)
            .populate("warehouseId", "warehouse_name location");
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

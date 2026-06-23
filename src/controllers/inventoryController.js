import Stock from "../models/stock.js";
import Transaction from "../models/transaction.js";
import Asset from "../models/asset.js";
import AuditLog from "../models/auditLog.js";
import { getAllowedWarehouseIds } from "../utils/rbacUtils.js";


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


export const handleTransaction = async (req, res) => {
    const { type, assetId, warehouseId, toWarehouseId, quantity, referenceNo, remarks } = req.body;

    try {

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

            const sourceStock = await Stock.findOne({ assetId, warehouseId });
            if (!sourceStock || sourceStock.quantity < quantity) {
                return res.status(400).json({ message: "Insufficient stock at source warehouse" });
            }
            sourceStock.quantity -= quantity;
            sourceStock.updatedAt = Date.now();
            await sourceStock.save();

           
            await Stock.findOneAndUpdate(
                { assetId, warehouseId: toWarehouseId },
                { $inc: { quantity: quantity }, updatedAt: Date.now() },
                { upsert: true, new: true }
            );
        } else if (type === "ADJUST") {
    
            await Stock.findOneAndUpdate(
                { assetId, warehouseId },
                { $inc: { quantity: quantity }, updatedAt: Date.now() },
                { upsert: true, new: true }
            );
        }

      
        await AuditLog.create({
            module: "Inventory",
            action: `STOCK_${type}`, 
            details: {
                quantity,
                referenceNo,
                remarks,
                warehouseId,
                toWarehouseId
            },
            performedBy: req.user?._id,
            targetId: assetId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(201).json({ 
            message: "Transaction processed successfully",
            transaction 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


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

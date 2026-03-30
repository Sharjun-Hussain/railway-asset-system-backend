import Stock from '../models/stock.js';
import StockTransaction from '../models/stocktransaction.js';
import mongoose from 'mongoose';

export const getStock = async (req, res) => {
    try {
        const filter = {};
        if (req.query.warehouseId) filter.warehouseId = req.query.warehouseId;
        if (req.query.productId) filter.productId = req.query.productId;

        const stock = await Stock.find(filter)
            .populate('warehouseId')
            .populate('productId');
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const handleTransaction = async (req, res) => {
    const { warehouseId, productId, type, quantity, reason, transaction_id } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Create Transaction Log
        const transaction = await StockTransaction.create([{
            transaction_id,
            warehouseId,
            productId,
            userId: req.user._id,
            type,
            quantity,
            reason
        }], { session });

        // 2. Update Stock
        let stock = await Stock.findOne({ warehouseId, productId }).session(session);

        if (!stock) {
            if (type === 'Issue' || type === 'Transfer') {
                throw new Error('Insufficient stock: Record not found');
            }
            stock = new Stock({ warehouseId, productId, quantity: 0 });
        }

        if (type === 'Receive') {
            stock.quantity += Number(quantity);
        } else if (type === 'Issue' || type === 'Transfer') {
            if (stock.quantity < quantity) {
                throw new Error('Insufficient stock');
            }
            stock.quantity -= Number(quantity);
        } else if (type === 'Adjustment') {
            stock.quantity = Number(quantity); // For adjustments, we might set absolute value or delta
        }

        await stock.save({ session });

        await session.commitTransaction();
        res.status(201).json(transaction[0]);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

export const getTransactions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.warehouseId) filter.warehouseId = req.query.warehouseId;
        if (req.user.role === 'Warehouse Manager' && req.user.warehouseId) {
            // Note: Warehouse Manager needs a warehouseId on User model or a different check
            // For now, assume global or filtered by query
        }

        const transactions = await StockTransaction.find(filter)
            .populate('warehouseId')
            .populate('productId')
            .populate('userId', 'full_name email')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

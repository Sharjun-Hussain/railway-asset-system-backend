import Station from '../models/station.js';
import Warehouse from '../models/warehouse.js';
import Stock from '../models/stock.js';
import User from '../models/user.js';
import { getAllowedWarehouseIds } from '../utils/rbacUtils.js';

// --- Warehouses ---
export const getWarehouses = async (req, res) => {
    try {
        const allowedWarehouseIds = await getAllowedWarehouseIds(req.user);
        const filter = {};
        if (req.query.stationId) filter.stationId = req.query.stationId;

        if (allowedWarehouseIds) {
            filter._id = { $in: allowedWarehouseIds };
        }

        const warehouses = await Warehouse.find(filter)
            .populate({
                path: 'stationId',
                select: 'station_name station_code'
            })
            .sort({ warehouse_name: 1 });

        res.status(200).json({
            success: true,
            count: warehouses.length,
            data: warehouses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching warehouses",
            error: error.message
        });
    }
};

export const createWarehouse = async (req, res) => {
    try {
        const { warehouse_name, warehouse_type, stationId, description, is_active } = req.body;

        const warehouse = await Warehouse.create({
            warehouse_name,
            warehouse_type,
            stationId,
            description,
            is_active: is_active !== undefined ? is_active : true
        });

        res.status(201).json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating warehouse",
            error: error.message
        });
    }
};

export const updateWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        const { warehouse_name, warehouse_type, stationId, description, is_active } = req.body;

        let warehouse = await Warehouse.findById(id);
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found"
            });
        }

        warehouse = await Warehouse.findByIdAndUpdate(
            id,
            { warehouse_name, warehouse_type, stationId, description, is_active, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating warehouse",
            error: error.message
        });
    }
};

export const deleteWarehouse = async (req, res) => {
    try {
        const { id } = req.params;

        const warehouse = await Warehouse.findById(id);
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found"
            });
        }

        // Check for associated stock
        const stockCount = await Stock.countDocuments({ warehouseId: id });
        if (stockCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete warehouse. It contains ${stockCount} stock items.`
            });
        }

        // Check for users specifically assigned to this warehouse
        const usersCount = await User.countDocuments({ warehouseIds: id });
        if (usersCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete warehouse. It is assigned to ${usersCount} users.`
            });
        }

        await Warehouse.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Warehouse deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting warehouse",
            error: error.message
        });
    }
};

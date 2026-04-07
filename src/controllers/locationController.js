import Station from '../models/station.js';
import Warehouse from '../models/warehouse.js';

// --- Warehouses ---
export const getWarehouses = async (req, res) => {
    try {
        const filter = {};
        if (req.query.stationId) filter.stationId = req.query.stationId;

        // RBAC: If user is Station Master, they can only see their station's warehouses
        if (req.user.role === 'Station Master' && req.user.stationId) {
            filter.stationId = req.user.stationId;
        }

        const warehouses = await Warehouse.find(filter).populate({
            path: 'stationId',
            populate: { path: 'divisionId' }
        });
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.create(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

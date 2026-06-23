import Station from "../models/station.js";
import Warehouse from "../models/warehouse.js";
import User from "../models/user.js";
import AuditLog from "../models/auditLog.js";
import { getAllowedStationIds } from "../utils/rbacUtils.js";


export const getStations = async (req, res) => {
    try {
        const allowedStationIds = await getAllowedStationIds(req.user);
        const filter = {};
        if (req.query.divisionId) filter.divisionId = req.query.divisionId;
        
        if (allowedStationIds) {
            filter._id = { $in: allowedStationIds };
        }

        const stations = await Station.find(filter)
            .populate('divisionId', 'division_name region')
            .sort({ station_name: 1 });

        res.status(200).json({
            success: true,
            count: stations.length,
            data: stations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching stations",
            error: error.message
        });
    }
};


export const createStation = async (req, res) => {
    try {
        const { station_name, station_code, address, divisionId, is_active } = req.body;

        const existingStation = await Station.findOne({ station_code });
        if (existingStation) {
            return res.status(400).json({
                success: false,
                message: "Station code already exists"
            });
        }

        const station = await Station.create({ 
            station_name, 
            station_code, 
            address, 
            divisionId,
            is_active: is_active !== undefined ? is_active : true
        });

        await AuditLog.create({
            module: "System Administration",
            action: "CREATE_STATION",
            details: { station_name, station_code, divisionId },
            performedBy: req.user?._id,
            targetId: station._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(201).json({
            success: true,
            data: station
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating station",
            error: error.message
        });
    }
};


export const updateStation = async (req, res) => {
    try {
        const { id } = req.params;
        const { station_name, station_code, address, divisionId, is_active } = req.body;

        let station = await Station.findById(id);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: "Station not found"
            });
        }

        // Check if code is changing and if it is unique
        if (station_code && station_code !== station.station_code) {
            const codeExists = await Station.findOne({ station_code });
            if (codeExists) {
                return res.status(400).json({
                    success: false,
                    message: "New station code already exists"
                });
            }
        }

        station = await Station.findByIdAndUpdate(
            id,
            { station_name, station_code, address, divisionId, is_active, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        await AuditLog.create({
            module: "System Administration",
            action: "UPDATE_STATION",
            details: { station_name, station_code, is_active },
            performedBy: req.user?._id,
            targetId: station._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({
            success: true,
            data: station
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating station",
            error: error.message
        });
    }
};


export const deleteStation = async (req, res) => {
    try {
        const { id } = req.params;

        const station = await Station.findById(id);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: "Station not found"
            });
        }

       
        const warehousesCount = await Warehouse.countDocuments({ stationId: id });
        if (warehousesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete station. It has ${warehousesCount} linked warehouses.`
            });
        }

       
        const usersCount = await User.countDocuments({ stationId: id });
        if (usersCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete station. It has ${usersCount} linked users.`
            });
        }

        await Station.findByIdAndDelete(id);

        await AuditLog.create({
            module: "System Administration",
            action: "DELETE_STATION",
            details: { station_name: station.station_name, station_code: station.station_code },
            performedBy: req.user?._id,
            targetId: id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({
            success: true,
            message: "Station deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting station",
            error: error.message
        });
    }
};

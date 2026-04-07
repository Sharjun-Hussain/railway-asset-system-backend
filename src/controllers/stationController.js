import Station from "../models/station.js";
import Warehouse from "../models/warehouse.js";
import User from "../models/user.js";

/**
 * @desc    Get all stations
 * @route   GET /api/stations
 * @access  Private/Protected
 */
export const getStations = async (req, res) => {
    try {
        const filter = {};
        if (req.query.divisionId) filter.divisionId = req.query.divisionId;

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

/**
 * @desc    Create a new station
 * @route   POST /api/stations
 * @access  Private/Manage
 */
export const createStation = async (req, res) => {
    try {
        const { station_name, station_code, address, divisionId } = req.body;

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
            divisionId 
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

/**
 * @desc    Update a station
 * @route   PUT /api/stations/:id
 * @access  Private/Manage
 */
export const updateStation = async (req, res) => {
    try {
        const { id } = req.params;
        const { station_name, station_code, address, divisionId } = req.body;

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
            { station_name, station_code, address, divisionId, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

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

/**
 * @desc    Delete a station
 * @route   DELETE /api/stations/:id
 * @access  Private/Manage
 */
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

        // Check for linked warehouses
        const warehousesCount = await Warehouse.countDocuments({ stationId: id });
        if (warehousesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete station. It has ${warehousesCount} linked warehouses.`
            });
        }

        // Check for linked users
        const usersCount = await User.countDocuments({ stationId: id });
        if (usersCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete station. It has ${usersCount} linked users.`
            });
        }

        await Station.findByIdAndDelete(id);

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

import Division from "../models/division.js";
import Station from "../models/station.js";
import { getAllowedDivisionIds } from "../utils/rbacUtils.js";

/**
 * @desc    Get all divisions
 * @route   GET /api/divisions
 * @access  Private/Protected
 */
export const getDivisions = async (req, res) => {
    try {
        const divisionIds = await getAllowedDivisionIds(req.user);
        const query = divisionIds ? { _id: { $in: divisionIds } } : {};
        const divisions = await Division.find(query).sort({ division_name: 1 });
        res.status(200).json({
            success: true,
            count: divisions.length,
            data: divisions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching divisions",
            error: error.message
        });
    }
};

/**
 * @desc    Create a new division
 * @route   POST /api/divisions
 * @access  Private/Manage
 */
export const createDivision = async (req, res) => {
    try {
        const { division_name, region, is_active } = req.body;

        const existingDivision = await Division.findOne({ division_name });
        if (existingDivision) {
            return res.status(400).json({
                success: false,
                message: "Division name already exists"
            });
        }

        const division = await Division.create({
            division_name,
            region,
            is_active: is_active !== undefined ? is_active : true
        });
        res.status(201).json({
            success: true,
            data: division
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating division",
            error: error.message
        });
    }
};

/**
 * @desc    Update a division
 * @route   PUT /api/divisions/:id
 * @access  Private/Manage
 */
export const updateDivision = async (req, res) => {
    try {
        const { id } = req.params;
        const { division_name, region, is_active } = req.body;

        let division = await Division.findById(id);
        if (!division) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        // Check if name is changing and if it is unique
        if (division_name && division_name !== division.division_name) {
            const nameExists = await Division.findOne({ division_name });
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: "New division name already exists"
                });
            }
        }

        division = await Division.findByIdAndUpdate(
            id,
            { division_name, region, is_active, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: division
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating division",
            error: error.message
        });
    }
};

/**
 * @desc    Delete a division
 * @route   DELETE /api/divisions/:id
 * @access  Private/Manage
 */
export const deleteDivision = async (req, res) => {
    try {
        const { id } = req.params;

        const division = await Division.findById(id);
        if (!division) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        // Prevent deletion if stations are linked
        const stationsCount = await Station.countDocuments({ divisionId: id });
        if (stationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete division. It has ${stationsCount} linked stations.`
            });
        }

        await Division.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Division deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting division",
            error: error.message
        });
    }
};

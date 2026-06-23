import Warehouse from '../models/warehouse.js';
import Station from '../models/station.js';

/**
 * Returns an array of Warehouse IDs that the user is authorized to access.
 * Returns null if the user is a Super Admin (full access).
 */
const isGlobalUser = (user) => {
    try {
        return user.roles?.some(r => r.name === 'Super Admin' || r.name === 'Auditor');
    } catch (err) {
        console.error("Error in isGlobalUser:", err);
        return false;
    }
};

const hasPermission = (user, module, action) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => {
        if (!role.permissions) return false;
        return role.permissions.some(p => p.module === module && p.name === action);
    });
};

export const getAllowedWarehouseIds = async (user) => {
    try {
        if (isGlobalUser(user)) return null;

        // 1. Warehouse Manager / Staff: Limited to specific warehouses
        if (user.warehouseIds && user.warehouseIds.length > 0) {
            return user.warehouseIds;
        }

        // 2. Station Master: Limited to all warehouses in their station
        if (user.stationId) {
            const warehouses = await Warehouse.find({ stationId: user.stationId }).select('_id');
            return warehouses.map(w => w._id);
        }

        // 3. Division Manager: Limited to all warehouses in all stations within their division
        if (user.divisionId) {
            const stations = await Station.find({ divisionId: user.divisionId }).select('_id');
            const stationIds = stations.map(s => s._id);
            const warehouses = await Warehouse.find({ stationId: { $in: stationIds } }).select('_id');
            return warehouses.map(w => w._id);
        }

        return [];
    } catch (error) {
        console.error("Error in getAllowedWarehouseIds:", error);
        throw error;
    }
};

/**
 * Returns an array of Station IDs that the user is authorized to access.
 */
export const getAllowedStationIds = async (user) => {
    if (isGlobalUser(user)) return null;

    if (user.stationId) return [user.stationId];

    if (user.divisionId) {
        const stations = await Station.find({ divisionId: user.divisionId }).select('_id');
        return stations.map(s => s._id);
    }

    return [];
};

/**
 * Returns an array of Division IDs that the user is authorized to access.
 */
export const getAllowedDivisionIds = async (user) => {
    if (isGlobalUser(user)) return null;

    // Users with manage permission on divisions should see all divisions
    if (hasPermission(user, 'division', 'manage')) return null;

    // Global view roles (like Auditor) have view permission but no specific division assigned
    if (hasPermission(user, 'division', 'view') && !user.divisionId) return null;

    if (user.divisionId) return [user.divisionId];

    return [];
};

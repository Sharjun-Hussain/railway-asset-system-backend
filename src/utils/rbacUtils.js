import Warehouse from '../models/warehouse.js';
import Station from '../models/station.js';

/**
 * Returns an array of Warehouse IDs that the user is authorized to access.
 * Returns null if the user is a Super Admin (full access).
 */
const hasBypassPermission = (user) => {
    const permissions = user.roles?.flatMap(r => r.permissions) || [];
    return permissions.some(p => p.module === 'system' && p.name === 'bypass_scope') || 
           user.roles?.some(r => r.name === 'Super Admin');
};

export const getAllowedWarehouseIds = async (user) => {
    if (hasBypassPermission(user)) return null;

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

    // 4. Default: No access if no scope is defined
    return [];
};

/**
 * Returns an array of Station IDs that the user is authorized to access.
 */
export const getAllowedStationIds = async (user) => {
    if (hasBypassPermission(user)) return null;

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
    if (hasBypassPermission(user)) return null;

    if (user.divisionId) return [user.divisionId];

    return [];
};

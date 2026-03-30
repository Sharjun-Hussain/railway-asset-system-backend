import Permission from '../models/permission.js';
import Role from '../models/role.js';

// --- Permissions ---
export const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ module: 1, name: 1 });
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPermission = async (req, res) => {
    try {
        const permission = await Permission.create(req.body);
        res.status(201).json(permission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Roles ---
export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteRole = async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Role deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import AuditLog from "../models/auditLog.js";

/**
 * Utility to log an action
 */
export const logActivity = async (req, module, action, details = {}, targetId = null) => {
    try {
        await AuditLog.create({
            module,
            action,
            details,
            targetId,
            performedBy: req.user?._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
};

/**
 * Controller to fetch audit logs
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { module, action, limit = 50, page = 1 } = req.query;
        const query = {};
        
        if (module) query.module = module;
        if (action) query.action = action;

        const logs = await AuditLog.find(query)
            .populate("performedBy", "full_name email")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            total,
            page: parseInt(page),
            data: logs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

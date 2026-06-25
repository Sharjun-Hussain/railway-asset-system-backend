import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      req.user = await User.findById(decoded.id)
        .select('-password_hash')
        .populate({
          path: 'roles',
          populate: { path: 'permissions' }
        })
        .populate('divisionId')
        .populate('stationId')
        .populate('warehouseIds');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


export const hasPermission = (module, permissionName) => {
  return (req, res, next) => {
   
    const roles = req.user.roles || [];
    const isSuperAdmin = roles.some(role => role.name === 'Super Admin');
    if (isSuperAdmin) return next();

    const hasPerm = roles.some(role =>
      role.permissions.some(perm =>
        perm.module === module && perm.name === permissionName
      )
    );

    if (!hasPerm) {
      return res.status(403).json({
        message: `Forbidden: You do not have '${permissionName}' permission for module '${module}'.`
      });
    }

    next();
  };
};


export const checkScope = (scopeType) => {
  return (req, res, next) => {
    const roles = req.user.roles || [];
    const isSuperAdmin = roles.some(role => role.name === 'Super Admin');
    if (isSuperAdmin) return next();


    if (scopeType === 'station') {
      const stationId = req.params.stationId || req.body.stationId || req.query.stationId || (req.params.id && req.baseUrl.includes('stations') ? req.params.id : null);
      if (stationId && req.user.stationId && stationId.toString() !== req.user.stationId.toString()) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this station.' });
      }
    }


    if (scopeType === 'division') {
      const divisionId = req.params.divisionId || req.body.divisionId || req.query.divisionId || (req.params.id && req.baseUrl.includes('divisions') ? req.params.id : null);
      if (divisionId && req.user.divisionId && divisionId.toString() !== req.user.divisionId.toString()) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this division.' });
      }
    }

    // Check warehouse scope
    if (scopeType === 'warehouse') {
      const warehouseId = req.params.warehouseId || req.body.warehouseId || req.query.warehouseId || (req.params.id && req.baseUrl.includes('warehouses') ? req.params.id : null);
      if (warehouseId && req.user.warehouseIds && req.user.warehouseIds.length > 0) {
        const hasAccess = req.user.warehouseIds.some(wid => wid.toString() === warehouseId.toString());
        if (!hasAccess) {
          return res.status(403).json({ message: 'Forbidden: You do not have access to this warehouse.' });
        }
      }
    }

    next();
  };
};
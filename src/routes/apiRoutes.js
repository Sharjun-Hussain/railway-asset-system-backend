import express from 'express';
import {
    getDivisions, createDivision,
    getStations, createStation,
    getWarehouses, createWarehouse
} from '../controllers/locationController.js';
import {
    getCategories, createCategory,
    getSubCategories, createSubCategory,
    getProducts, createProduct
} from '../controllers/assetController.js';
import {
    getStock, handleTransaction, getTransactions
} from '../controllers/inventoryController.js';
import {
    getPermissions, createPermission,
    getRoles, createRole, updateRole, deleteRole
} from '../controllers/roleController.js';
import { protect, hasPermission, checkScope } from '../middlewares/authmiddleware.js';

const router = express.Router();

// --- Role & Permission Management ---
router.route('/permissions')
    .get(protect, hasPermission('rbac', 'view'), getPermissions)
    .post(protect, hasPermission('rbac', 'manage'), createPermission);

router.route('/roles')
    .get(protect, hasPermission('rbac', 'view'), getRoles)
    .post(protect, hasPermission('rbac', 'manage'), createRole);

router.route('/roles/:id')
    .put(protect, hasPermission('rbac', 'manage'), updateRole)
    .delete(protect, hasPermission('rbac', 'manage'), deleteRole);

// --- Location Routes ---
router.route('/divisions')
    .get(protect, hasPermission('location', 'view'), getDivisions)
    .post(protect, hasPermission('location', 'manage'), createDivision);

router.route('/stations')
    .get(protect, hasPermission('location', 'view'), getStations)
    .post(protect, hasPermission('location', 'manage'), createStation);

router.route('/warehouses')
    .get(protect, hasPermission('location', 'view'), getWarehouses)
    .post(protect, hasPermission('location', 'manage'), createWarehouse);

// --- Asset Routes ---
router.route('/categories')
    .get(protect, hasPermission('product', 'view'), getCategories)
    .post(protect, hasPermission('product', 'manage'), createCategory);

router.route('/subcategories')
    .get(protect, hasPermission('product', 'view'), getSubCategories)
    .post(protect, hasPermission('product', 'manage'), createSubCategory);

router.route('/products')
    .get(protect, hasPermission('product', 'view'), getProducts)
    .post(protect, hasPermission('product', 'manage'), createProduct);

// --- Inventory Routes ---
router.route('/stock')
    .get(protect, hasPermission('stock', 'view'), getStock);

router.route('/transactions')
    .get(protect, hasPermission('stock', 'view'), getTransactions)
    .post(protect, hasPermission('stock', 'receive'), handleTransaction);

export default router;


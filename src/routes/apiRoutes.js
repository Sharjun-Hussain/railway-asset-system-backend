import express from 'express';
import {
    getDivisions, createDivision, updateDivision, deleteDivision
} from '../controllers/divisionController.js';
import {
    getStations, createStation, updateStation, deleteStation
} from '../controllers/stationController.js';
import {
    getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse
} from '../controllers/locationController.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory } from "../controllers/subCategoryController.js";
import { getAssets, createAsset, updateAsset, deleteAsset } from "../controllers/assetController.js";
import { getStock, handleTransaction, getAssetStock, getTransactions } from "../controllers/inventoryController.js";
import {
    getPermissions, createPermission,
    getRoles, createRole, updateRole, deleteRole
} from '../controllers/roleController.js';
import { getUsers, updateUser, inviteUser } from '../controllers/authController.js';
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

// --- User Management ---
router.route('/users')
    .get(protect, hasPermission('user', 'view'), getUsers)
    .post(protect, hasPermission('user', 'manage'), inviteUser);

router.route('/users/:id')
    .put(protect, hasPermission('user', 'manage'), updateUser);

// --- Location Routes ---
router.route('/divisions')
    .get(protect, hasPermission('division', 'view'), getDivisions)
    .post(protect, hasPermission('division', 'manage'), createDivision);

router.route('/divisions/:id')
    .put(protect, hasPermission('division', 'manage'), updateDivision)
    .delete(protect, hasPermission('division', 'manage'), deleteDivision);

router.route('/stations')
    .get(protect, hasPermission('station', 'view'), getStations)
    .post(protect, hasPermission('station', 'manage'), createStation);

router.route('/stations/:id')
    .put(protect, hasPermission('station', 'manage'), updateStation)
    .delete(protect, hasPermission('station', 'manage'), deleteStation);

router.route('/warehouses')
    .get(protect, hasPermission('warehouse', 'view'), getWarehouses)
    .post(protect, hasPermission('warehouse', 'manage'), createWarehouse);

router.route('/warehouses/:id')
    .put(protect, hasPermission('warehouse', 'manage'), updateWarehouse)
    .delete(protect, hasPermission('warehouse', 'manage'), deleteWarehouse);


// --- Asset Routes ---
router.route('/categories')
    .get(protect, hasPermission('product', 'view'), getCategories)
    .post(protect, hasPermission('product', 'manage'), createCategory);

router.route('/categories/:id')
    .put(protect, hasPermission('product', 'manage'), updateCategory)
    .delete(protect, hasPermission('product', 'manage'), deleteCategory);

router.route('/subcategories')
    .get(protect, hasPermission('product', 'view'), getSubCategories)
    .post(protect, hasPermission('product', 'manage'), createSubCategory);

router.route('/subcategories/:id')
    .put(protect, hasPermission('product', 'manage'), updateSubCategory)
    .delete(protect, hasPermission('product', 'manage'), deleteSubCategory);

// Asset Catalog Routes
router.route("/assets")
    .get(protect, hasPermission('product', 'view'), getAssets)
    .post(protect, hasPermission('product', 'manage'), createAsset);

router.route("/assets/:id")
    .put(protect, hasPermission('product', 'manage'), updateAsset)
    .delete(protect, hasPermission('product', 'manage'), deleteAsset);

// Inventory / Stock Routes
router.get("/inventory", protect, hasPermission('stock', 'view'), getStock);
router.get("/inventory/asset/:id", protect, hasPermission('stock', 'view'), getAssetStock);

router.route('/transactions')
    .get(protect, hasPermission('stock', 'view'), getTransactions)
    .post(protect, hasPermission('stock', 'receive'), checkScope('warehouse'), handleTransaction);

export default router;

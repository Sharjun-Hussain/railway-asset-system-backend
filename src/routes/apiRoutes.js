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
import { protect, authorizeRoles, checkScope } from '../middlewares/authmiddleware.js';

const router = express.Router();

// --- Location Routes ---
router.route('/divisions')
    .get(protect, getDivisions)
    .post(protect, authorizeRoles('Super Admin'), createDivision);

router.route('/stations')
    .get(protect, getStations)
    .post(protect, authorizeRoles('Super Admin', 'Division Manager'), createStation);

router.route('/warehouses')
    .get(protect, getWarehouses)
    .post(protect, authorizeRoles('Super Admin', 'Division Manager', 'Station Master'), createWarehouse);

// --- Asset Routes ---
router.route('/categories')
    .get(protect, getCategories)
    .post(protect, authorizeRoles('Super Admin'), createCategory);

router.route('/subcategories')
    .get(protect, getSubCategories)
    .post(protect, authorizeRoles('Super Admin'), createSubCategory);

router.route('/products')
    .get(protect, getProducts)
    .post(protect, authorizeRoles('Super Admin'), createProduct);

// --- Inventory Routes ---
router.route('/stock')
    .get(protect, getStock);

router.route('/transactions')
    .get(protect, getTransactions)
    .post(protect, handleTransaction);

export default router;

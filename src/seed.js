import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import Division from './models/division.js';
import Station from './models/station.js';
import Warehouse from './models/warehouse.js';
import User from './models/user.js';
import Category from './models/category.js';
import SubCategory from './models/subcategory.js';
import Product from './models/product.js';
import Stock from './models/stock.js';
import StockTransaction from './models/stocktransaction.js';
import Permission from './models/permission.js';
import Role from './models/role.js';

import { divisions } from './seeder/divisions.js';
import { createStations } from './seeder/stations.js';
import { createWarehouses } from './seeder/warehouses.js';
import { createUsers } from './seeder/users.js';
import { categories } from './seeder/categories.js';
import { createSubCategories } from './seeder/subcategories.js';
import { createProducts } from './seeder/products.js';
import { permissions } from './seeder/permissions.js';
import { createRoles } from './seeder/roles.js';

dotenv.config();

const clearData = async () => {
  try {
    await StockTransaction.deleteMany();
    await Stock.deleteMany();
    await Product.deleteMany();
    await SubCategory.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    await Role.deleteMany();
    await Permission.deleteMany();
    await Warehouse.deleteMany();
    await Station.deleteMany();
    await Division.deleteMany();
  } catch (err) {
    console.error(err);
  }
};

const seedData = async () => {
  try {

    const createdPermissions = await Permission.insertMany(permissions);
    const permMap = createdPermissions.reduce((acc, p) => {
      acc[`${p.module}.${p.name}`] = p._id;
      return acc;
    }, {});
    console.log('Permissions seeded...');

    const roles = createRoles(permMap);
    const createdRoles = await Role.insertMany(roles);
    const roleMap = createdRoles.reduce((acc, r) => {
      acc[r.name] = r._id;
      return acc;
    }, {});
    console.log('Roles seeded...');

    const createdDivisions = await Division.insertMany(divisions);
    const divisionMap = createdDivisions.reduce((acc, d) => {
      acc[d.division_name] = d._id;
      return acc;
    }, {});
    console.log('Divisions seeded...');

    const stationData = createStations(divisionMap);
    const createdStations = await Station.insertMany(stationData);
    const stationMap = createdStations.reduce((acc, s) => {
      acc[s.station_name] = s._id;
      return acc;
    }, {});
    console.log('Stations seeded...');

    const warehouseData = createWarehouses(stationMap);
    const createdWarehouses = await Warehouse.insertMany(warehouseData);
    const warehouseMap = createdWarehouses.reduce((acc, w) => {
      acc[w.warehouse_name] = w._id;
      return acc;
    }, {});
    console.log('Warehouses seeded...');

    const createdCategories = await Category.insertMany(categories);
    const categoryMap = createdCategories.reduce((acc, c) => {
      acc[c.category_name] = c._id;
      return acc;
    }, {});
    console.log('Categories seeded...');

    const subCategoryData = createSubCategories(categoryMap);
    const createdSubCategories = await SubCategory.insertMany(subCategoryData);
    const subCategoryMap = createdSubCategories.reduce((acc, s) => {
      acc[s.sub_category_name] = s._id;
      return acc;
    }, {});
    console.log('SubCategories seeded...');

    const productData = createProducts(categoryMap, subCategoryMap);
    await Product.insertMany(productData);
    console.log('Products seeded...');

    const userData = await createUsers(roleMap, stationMap, divisionMap, warehouseMap);
    await User.insertMany(userData);
    console.log('Users seeded...');

    console.log('Data Seeding Complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await clearData();
  await seedData();
};

run();
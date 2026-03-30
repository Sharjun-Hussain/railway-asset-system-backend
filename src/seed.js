import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// --- Load Models ---
import Division from './models/division.js';
import Station from './models/station.js';
import Warehouse from './models/warehouse.js';
import User from './models/user.js';
import Category from './models/category.js';
import SubCategory from './models/subcategory.js';
import Product from './models/product.js';
import Stock from './models/stock.js';
import StockTransaction from './models/stocktransaction.js';

// --- Load Seeder Data ---
import { divisions } from './seeder/divisions.js';
import { createStations } from './seeder/stations.js';
import { createWarehouses } from './seeder/warehouses.js';
import { createUsers } from './seeder/users.js';
import { categories } from './seeder/categories.js';
import { createSubCategories } from './seeder/subcategories.js';
import { createProducts } from './seeder/products.js';

dotenv.config();

const clearData = async () => {
  try {
    await StockTransaction.deleteMany();
    await Stock.deleteMany();
    await Product.deleteMany();
    await SubCategory.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    await Warehouse.deleteMany();
    await Station.deleteMany();
    await Division.deleteMany();
    console.log('Data Cleared...');
  } catch (err) {
    console.error(err);
  }
};

const seedData = async () => {
  try {
    // 1. Divisions
    const createdDivisions = await Division.insertMany(divisions);
    const divisionMap = createdDivisions.reduce((acc, d) => {
      acc[d.division_name] = d._id;
      return acc;
    }, {});
    console.log('Divisions seeded...');

    // 2. Stations
    const stations = createStations(divisionMap);
    const createdStations = await Station.insertMany(stations);
    const stationMap = createdStations.reduce((acc, s) => {
      acc[s.station_name] = s._id;
      return acc;
    }, {});
    console.log('Stations seeded...');

    // 3. Warehouses
    const warehouses = createWarehouses(stationMap);
    await Warehouse.insertMany(warehouses);
    console.log('Warehouses seeded...');

    // 4. Categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = createdCategories.reduce((acc, c) => {
      acc[c.category_name] = c._id;
      return acc;
    }, {});
    console.log('Categories seeded...');

    // 5. SubCategories
    const subCategories = createSubCategories(categoryMap);
    const createdSubCategories = await SubCategory.insertMany(subCategories);
    const subCategoryMap = createdSubCategories.reduce((acc, s) => {
      acc[s.sub_category_name] = s._id;
      return acc;
    }, {});
    console.log('SubCategories seeded...');

    // 6. Products
    const products = createProducts(categoryMap, subCategoryMap);
    await Product.insertMany(products);
    console.log('Products seeded...');

    // 7. Users
    const users = await createUsers(stationMap, divisionMap);
    await User.insertMany(users);
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
  if (process.argv[2] === '-d') {
    await clearData();
    process.exit();
  } else {
    await clearData();
    await seedData();
  }
};

run();
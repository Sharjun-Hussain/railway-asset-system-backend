import mongoose from 'mongoose';
import dotenv from 'dotenv';



// --- Load Models ---
import Permission from './models/permission.js';
import Department from './models/departments.js';
import Warehouse from './models/warehouse.js';
import Role from './models/role.js';
import User from './models/user.js';
import Asset from './models/asset.js';
import InventoryAdjustment from './models/inventory-adjustments.js';
import RAGKnowledge from './models/RAGknowledge.js';

// --- Load Data ---
import { permissions } from './seeder/permissions.js';
import { departments } from './seeder/departments.js';
import { getWarehouses } from './seeder/warehouses.js';
import { getRoles } from './seeder/roles.js';
import { getUsers } from './seeder/users.js';
import { getAssets } from './seeder/assets.js';
import { getAdjustments } from './seeder/adjustment.js';
import { connectDB } from './config/db.js';

connectDB();

const clearData = async () => {
  try {
    // Clear in reverse order of creation
    // await RAGKnowledge.deleteMany();
    await InventoryAdjustment.deleteMany();
    await Asset.deleteMany();
    await User.deleteMany(); // Users are cleared
    await Role.deleteMany();
    await Warehouse.deleteMany(); // Warehouses are cleared
    await Department.deleteMany();
    await Permission.deleteMany();

    console.log('Data Cleared...');
  } catch (err) {
    console.error(err);
  }
};

const seedData = async () => {
  try {
    // 1. Permissions
    const createdPermissions = await Permission.insertMany(permissions);
    console.log('Permissions seeded...');

    // 2. Departments
    const createdDepartments = await Department.insertMany(departments);
    console.log('Departments seeded...');

    // 3. Warehouses (needs department data)
    const warehouses = await getWarehouses();
    const createdWarehouses = await Warehouse.insertMany(warehouses);
    console.log('Warehouses seeded...');

    // 4. Roles (needs perms, depts, warehouses)
    const roles = await getRoles();
    const createdRoles = await Role.insertMany(roles);
    console.log('Roles seeded...');

    // 5. Users (needs roles)
    const users = await getUsers();
    const createdUsers = await User.insertMany(users);
    console.log('Users seeded...');

    // 6. UPDATE Warehouse.users array (This is the tricky step from your schema)
    const jaffnaStaff = await User.findOne({ email: "jaffna.staff@slrail.lk" });
    const jaffnaStaffRole = await Role.findOne({ name: "Jaffna Warehouse Staff" });
    const jaffnaWarehouse = await Warehouse.findOne({ name: "Jaffna Main Warehouse" });

    if (jaffnaStaff && jaffnaWarehouse && jaffnaStaffRole) {
      jaffnaWarehouse.users.push({
        userId: jaffnaStaff._id,
        role: jaffnaStaffRole.name,
        permissions: ["adjust_inventory"] // From your schema
      });
      await jaffnaWarehouse.save();
      console.log('Warehouse user assignments updated...');
    }
    // (Repeat for other users and warehouses as needed)

    // 7. Assets (needs warehouses, depts)
    const assets = await getAssets();
    await Asset.insertMany(assets);
    console.log('Assets seeded...');

    // 8. Adjustments (needs assets, users)
    const adjustments = await getAdjustments();
    await InventoryAdjustment.insertMany(adjustments);
    console.log('Adjustments seeded...');

    // // 9. RAG Knowledge (needs assets)
    // const ragData = await getRagData();
    // await RAGKnowledge.insertMany(ragData);
    // console.log('RAG Knowledge seeded...'.green);

    console.log('Data Seeding Complete!');
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// --- Script Runner ---
const run = async () => {
  await connectDB();

  if (process.argv[2] === '-d') {
    await clearData();
    process.exit();
  } else {
    await clearData(); // Clear first
    await seedData();
  }
};

run();
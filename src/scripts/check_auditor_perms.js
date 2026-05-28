import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const role = await Role.findOne({ name: 'Auditor' }).populate('permissions');
  if (role) {
    console.log(role.permissions.map(p => `${p.module}.${p.name}`));
  } else {
    console.log('Auditor role not found');
  }
  process.exit();
};
run();

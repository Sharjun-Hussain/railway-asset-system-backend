import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Permission from '../models/permission.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const perms = await Permission.find();
  console.log(perms.map(p => `${p.module}.${p.name}`));
  process.exit();
};
run();

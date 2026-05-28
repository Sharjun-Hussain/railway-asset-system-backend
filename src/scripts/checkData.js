import mongoose from "mongoose";
import dotenv from "dotenv";
import Asset from "../models/asset.js";
import Stock from "../models/stock.js";
import Transaction from "../models/transaction.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Assets:", await Asset.countDocuments());
    console.log("Stocks:", await Stock.countDocuments());
    console.log("Transactions:", await Transaction.countDocuments());
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};
run();

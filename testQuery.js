import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import Transaction from './src/models/transaction.js';
import Warehouse from "./src/models/warehouse.js";
import Station from "./src/models/station.js";
import Division from "./src/models/division.js";
import Asset from "./src/models/asset.js";
import User from "./src/models/user.js";

dotenv.config();

const run = async () => {
    await connectDB();
    try {
        const transactions = await Transaction.find({})
            .populate("assetId", "asset_name qr_code")
            .populate({
                path: "warehouseId",
                select: "warehouse_name stationId",
                populate: {
                    path: "stationId",
                    select: "station_name divisionId",
                    populate: {
                        path: "divisionId",
                        select: "division_name"
                    }
                }
            })
            .populate({
                path: "toWarehouseId",
                select: "warehouse_name stationId",
                populate: {
                    path: "stationId",
                    select: "station_name divisionId",
                    populate: {
                        path: "divisionId",
                        select: "division_name"
                    }
                }
            })
            .populate("performedBy", "full_name")
            .sort({ createdAt: -1 });
            
        console.log("Success! Found:", transactions.length);
    } catch (e) {
        console.error("FAILED:", e);
    }
    process.exit(0);
};

run();

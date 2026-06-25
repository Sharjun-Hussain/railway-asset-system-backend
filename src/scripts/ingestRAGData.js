import mongoose from "mongoose";
import OpenAI from "openai";
import dotenv from "dotenv";
import RAGknowledge from "../models/RAGknowledge.js";
import Asset from "../models/asset.js";
import Stock from "../models/stock.js";
import Category from "../models/category.js";
import SubCategory from "../models/subcategory.js";
import Station from "../models/station.js";
import Warehouse from "../models/warehouse.js";
import Transaction from "../models/transaction.js";
import Division from "../models/division.js";
import User from "../models/user.js";
import Role from "../models/role.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ingestAssetsToRAG = async () => {
  try {
    console.log("Starting asset and stock ingestion to RAGknowledge...");
    
    // 1. Ingest Global Assets
    const assets = await Asset.find({}).populate('categoryId subCategoryId');
    for (const asset of assets) {
      const content = `Asset Name: ${asset.asset_name}
QR Code: ${asset.qr_code}
Unit: ${asset.unit}
Category: ${asset.categoryId?.name || 'N/A'}
Description: ${asset.description || 'N/A'}`;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await RAGknowledge.findOneAndUpdate(
        { relatedAssetId: asset._id, source: "Asset Catalog" },
        {
          source: "Asset Catalog",
          content,
          embedding: embeddingResponse.data[0].embedding,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Ingested ${assets.length} global assets.`);

    // 2. Ingest Scoped Stock
    const stocks = await Stock.find({}).populate({
        path: 'warehouseId',
        populate: { path: 'stationId' }
    }).populate('assetId');

    for (const stock of stocks) {
      if (!stock.assetId || !stock.warehouseId) continue;
      
      const content = `Stock Level Report
Asset Name: ${stock.assetId.asset_name}
Warehouse: ${stock.warehouseId.warehouse_name}
Quantity Available: ${stock.quantity}
Minimum Level Required: ${stock.min_level}
Location: Station ${stock.warehouseId.stationId?.name || 'Unknown'}`;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await RAGknowledge.findOneAndUpdate(
        { relatedAssetId: stock.assetId._id, warehouseId: stock.warehouseId._id, source: "Warehouse Stock" },
        {
          source: "Warehouse Stock",
          content,
          embedding: embeddingResponse.data[0].embedding,
          warehouseId: stock.warehouseId._id,
          stationId: stock.warehouseId.stationId?._id || null,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Ingested ${stocks.length} scoped stock records.`);

    // 3. Ingest Transactions (Who did what)
    const transactions = await Transaction.find({}).populate('assetId warehouseId toWarehouseId performedBy');
    for (const txn of transactions) {
      if (!txn.assetId || !txn.warehouseId) continue;
      
      const content = `Transaction Log (Stock History)
Action Type: ${txn.type}
Asset: ${txn.assetId.asset_name}
Quantity: ${txn.quantity}
Reference No: ${txn.referenceNo}
From Warehouse: ${txn.warehouseId.warehouse_name}
${txn.toWarehouseId ? `To Warehouse: ${txn.toWarehouseId.warehouse_name}\n` : ''}Performed By: ${txn.performedBy?.full_name || 'Unknown'}
Date: ${txn.createdAt}
Remarks: ${txn.remarks || 'None'}`;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await RAGknowledge.findOneAndUpdate(
        { source: "Transaction Log (Stock History)", content: { $regex: txn.referenceNo } }, // Use reference no to match
        {
          source: "Transaction Log (Stock History)",
          content,
          embedding: embeddingResponse.data[0].embedding,
          warehouseId: txn.warehouseId._id,
          // Since it's a historical log, we tag it to the warehouse where it happened
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Ingested ${transactions.length} transaction records.`);

    // 4. Ingest Divisions
    const divisions = await Division.find({});
    for (const division of divisions) {
      const content = `Railway Division
Division Name: ${division.division_name}
Region: ${division.region}
Status: ${division.is_active ? 'Active' : 'Inactive'}`;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await RAGknowledge.findOneAndUpdate(
        { source: "Division", divisionId: division._id },
        {
          source: "Division",
          content,
          embedding: embeddingResponse.data[0].embedding,
          divisionId: division._id,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Ingested ${divisions.length} divisions.`);

    // 5. Ingest Stations
    const stations = await Station.find({}).populate('divisionId');
    for (const station of stations) {
      const content = `Railway Station
Station Name: ${station.station_name}
Station Code: ${station.station_code}
Address: ${station.address || 'N/A'}
Division: ${station.divisionId?.division_name || 'N/A'}
Region: ${station.divisionId?.region || 'N/A'}
Status: ${station.is_active ? 'Active' : 'Inactive'}`;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await RAGknowledge.findOneAndUpdate(
        { source: "Station", stationId: station._id },
        {
          source: "Station",
          content,
          embedding: embeddingResponse.data[0].embedding,
          stationId: station._id,
          divisionId: station.divisionId?._id || null,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Ingested ${stations.length} stations.`);

    // 6. Ingest Warehouses
    const warehouses = await Warehouse.find({}).populate({ path: 'stationId', populate: { path: 'divisionId' } });
    for (const warehouse of warehouses) {
      const content = `Warehouse
Warehouse Name: ${warehouse.warehouse_name}
Type: ${warehouse.warehouse_type}
Description: ${warehouse.description || 'N/A'}
Station: ${warehouse.stationId?.station_name || 'N/A'}
Station Code: ${warehouse.stationId?.station_code || 'N/A'}
Division: ${warehouse.stationId?.divisionId?.division_name || 'N/A'}
Status: ${warehouse.is_active ? 'Active' : 'Inactive'}`;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await RAGknowledge.findOneAndUpdate(
        { source: "Warehouse", warehouseId: warehouse._id },
        {
          source: "Warehouse",
          content,
          embedding: embeddingResponse.data[0].embedding,
          warehouseId: warehouse._id,
          stationId: warehouse.stationId?._id || null,
          divisionId: warehouse.stationId?.divisionId?._id || null,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Ingested ${warehouses.length} warehouses.`);
    // 7. Ingest Users
    const users = await mongoose.model("User").find({}).populate('roles divisionId stationId warehouseIds');
    for (const user of users) {
      const roleNames = user.roles?.map(r => r.name).join(", ") || 'None';
      const divisionName = user.divisionId?.division_name || 'N/A';
      const stationName = user.stationId?.station_name || 'N/A';
      const warehouseNames = user.warehouseIds?.map(w => w.warehouse_name).join(", ") || 'N/A';

      const content = `System User Profile
Name: ${user.full_name}
Email: ${user.email}
Roles: ${roleNames}
Division: ${divisionName}
Station: ${stationName}
Warehouses: ${warehouseNames}
Status: ${user.isActive ? 'Active' : 'Inactive'}`;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await RAGknowledge.findOneAndUpdate(
        { source: "System User", relatedAssetId: user._id },
        {
          source: "System User",
          content,
          embedding: embeddingResponse.data[0].embedding,
          relatedAssetId: user._id,
          divisionId: user.divisionId?._id || null,
          stationId: user.stationId?._id || null,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Ingested ${users.length} users.`);
  } catch (error) {
    console.error("Error ingesting data:", error);
  }
};

// If run directly via `node src/scripts/ingestRAGData.js`
if (process.argv[1] && process.argv[1].endsWith('ingestRAGData.js')) {
    // Need to connect to mongoose first if running standalone
    mongoose.connect(process.env.MONGO_URI)
        .then(async () => {
            console.log("Connected to MongoDB");
            await ingestAssetsToRAG();
            console.log("Ingestion complete. Exiting...");
            process.exit(0);
        })
        .catch(err => {
            console.error("MongoDB Connection Error:", err);
            process.exit(1);
        });
}

import OpenAI from "openai";
import RAGknowledge from "../models/RAGknowledge.js";
import Asset from "../models/asset.js";
import Stock from "../models/stock.js";
import Transaction from "../models/transaction.js";
import Division from "../models/division.js";
import Station from "../models/station.js";
import Warehouse from "../models/warehouse.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const syncAssetToRAG = async (assetId) => {
  try {
    const asset = await Asset.findById(assetId).populate('categoryId subCategoryId');
    if (!asset) return;

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
  } catch (error) {
    console.error("Background RAG Sync Error (Asset):", error);
  }
};

export const syncStockToRAG = async (stockId) => {
  try {
    const stock = await Stock.findById(stockId).populate({
        path: 'warehouseId',
        populate: { 
            path: 'stationId',
            populate: { path: 'divisionId' }
        }
    }).populate('assetId');

    if (!stock || !stock.assetId || !stock.warehouseId) return;
    
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
        divisionId: stock.warehouseId.stationId?.divisionId?._id || null,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Background RAG Sync Error (Stock):", error);
  }
};

export const syncTransactionToRAG = async (transactionId) => {
  try {
    const txn = await Transaction.findById(transactionId)
      .populate('assetId toWarehouseId performedBy')
      .populate({
        path: 'warehouseId',
        populate: { 
            path: 'stationId',
            populate: { path: 'divisionId' }
        }
      });
    if (!txn || !txn.assetId || !txn.warehouseId) return;

    const txnDate = new Date(txn.createdAt).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    const content = `Transaction Log (Stock History)
Action Type: ${txn.type}
Asset: ${txn.assetId.asset_name}
Quantity: ${txn.quantity}
Reference No: ${txn.referenceNo}
From Warehouse: ${txn.warehouseId.warehouse_name}
${txn.toWarehouseId ? `To Warehouse: ${txn.toWarehouseId.warehouse_name}\n` : ''}Performed By: ${txn.performedBy?.full_name || 'Unknown'}
Date: ${txnDate}
Remarks: ${txn.remarks || 'None'}`;

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });

    await RAGknowledge.create({
      source: "Transaction Log",
      content,
      embedding: embeddingResponse.data[0].embedding,
      warehouseId: txn.warehouseId._id,
      stationId: txn.warehouseId.stationId?._id || null,
      divisionId: txn.warehouseId.stationId?.divisionId?._id || null,
    });
  } catch (error) {
    console.error("Background RAG Sync Error (Transaction):", error);
  }
};

export const syncDivisionToRAG = async (divisionId) => {
  try {
    const division = await Division.findById(divisionId);
    if (!division) return;

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
      { source: "Division", content, embedding: embeddingResponse.data[0].embedding, divisionId: division._id },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Background RAG Sync Error (Division):", error);
  }
};

export const syncStationToRAG = async (stationId) => {
  try {
    const station = await Station.findById(stationId).populate('divisionId');
    if (!station) return;

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
      { source: "Station", content, embedding: embeddingResponse.data[0].embedding, stationId: station._id, divisionId: station.divisionId?._id || null },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Background RAG Sync Error (Station):", error);
  }
};

export const syncWarehouseToRAG = async (warehouseId) => {
  try {
    const warehouse = await Warehouse.findById(warehouseId).populate({ path: 'stationId', populate: { path: 'divisionId' } });
    if (!warehouse) return;

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
      { source: "Warehouse", content, embedding: embeddingResponse.data[0].embedding, warehouseId: warehouse._id, stationId: warehouse.stationId?._id || null, divisionId: warehouse.stationId?.divisionId?._id || null },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Background RAG Sync Error (Warehouse):", error);
  }
};

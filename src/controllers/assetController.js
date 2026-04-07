import Asset from "../models/asset.js";
import SubCategory from "../models/subcategory.js";
import Stock from "../models/stock.js";

// @desc    Get all assets
// @route   GET /api/v1/assets
export const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find()
            .populate("categoryId", "category_name")
            .populate("subCategoryId", "sub_category_name")
            .sort({ createdAt: -1 });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new asset
// @route   POST /api/v1/assets
export const createAsset = async (req, res) => {
    const { asset_name, qr_code, unit, categoryId, subCategoryId, description } = req.body;

    try {
        const asset = await Asset.create({
            asset_name,
            qr_code,
            unit,
            categoryId,
            subCategoryId,
            description
        });

        // Populate and return
        const populatedAsset = await Asset.findById(asset._id)
            .populate("categoryId", "category_name")
            .populate("subCategoryId", "sub_category_name");

        res.status(201).json(populatedAsset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update asset
// @route   PUT /api/v1/assets/:id
export const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        const updatedAsset = await Asset.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        ).populate("categoryId", "category_name")
         .populate("subCategoryId", "sub_category_name");

        res.json(updatedAsset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete asset
// @route   DELETE /api/v1/assets/:id
export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        // Safety Check: Check if any stock exists for this asset
        const stockExists = await Stock.findOne({ assetId: req.params.id, quantity: { $gt: 0 } });
        if (stockExists) {
            return res.status(400).json({ 
                message: "Cannot delete asset: Active stock levels exist in one or more warehouses." 
            });
        }

        await Asset.findByIdAndDelete(req.params.id);
        res.json({ message: "Asset definition removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

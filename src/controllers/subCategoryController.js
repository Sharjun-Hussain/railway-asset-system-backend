import asset from '../models/asset.js';
import SubCategory from '../models/subcategory.js';


// Get all sub-categories
export const getSubCategories = async (req, res) => {
    try {
        const filter = {};
        if (req.query.categoryId) filter.categoryId = req.query.categoryId;
        const subCategories = await SubCategory.find(filter)
            .populate('categoryId')
            .sort({ sub_category_name: 1 });
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new sub-category
export const createSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.create(req.body);
        res.status(201).json(subCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a sub-category
export const updateSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });
        res.json(subCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a sub-category
export const deleteSubCategory = async (req, res) => {
    try {
        // Check if there are any products using this sub-category
        const productCount = await asset.countDocuments({ subCategoryId: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({
                message: "Cannot delete sub-category: It is currently linked to active products."
            });
        }

        const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
        if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

        res.json({ message: "SubCategory deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

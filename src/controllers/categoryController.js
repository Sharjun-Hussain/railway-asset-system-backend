import asset from '../models/asset.js';
import Category from '../models/category.js';
import SubCategory from '../models/subcategory.js';


// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new category
export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a category
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        // Check if there are any sub-categories using this category
        const subCategoryCount = await SubCategory.countDocuments({ categoryId: req.params.id });
        if (subCategoryCount > 0) {
            return res.status(400).json({
                message: "Cannot delete category: It has active sub-categories. Delete or move them first."
            });
        }

        // Check if there are any products using this category
        const productCount = await asset.countDocuments({ categoryId: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({
                message: "Cannot delete category: It is currently linked to active products."
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

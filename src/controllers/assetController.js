import Category from '../models/category.js';
import SubCategory from '../models/subcategory.js';
import Product from '../models/product.js';

// --- Categories ---
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- SubCategories ---
export const getSubCategories = async (req, res) => {
    try {
        const filter = {};
        if (req.query.categoryId) filter.categoryId = req.query.categoryId;
        const subCategories = await SubCategory.find(filter).populate('categoryId');
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.create(req.body);
        res.status(201).json(subCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Products ---
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('categoryId')
            .populate('subCategoryId');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

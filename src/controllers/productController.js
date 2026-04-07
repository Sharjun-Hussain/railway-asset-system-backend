import Product from '../models/product.js';

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('categoryId')
            .populate('subCategoryId')
            .sort({ product_name: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        // Basic check for existing unique field
        if (productData.qr_code) {
          const existing = await Product.findOne({ qr_code: productData.qr_code });
          if (existing) return res.status(400).json({ message: "QR Code already exists." });
        }
        
        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            { ...req.body, updatedAt: Date.now() }, 
            { new: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        // Need to check if there is stock for this product in any warehouse
        // For now, let's just delete the product definition.
        // In a real scenario, we might want to check the Stock model.
        
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

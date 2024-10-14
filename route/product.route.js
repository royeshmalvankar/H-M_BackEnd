const express = require('express');
const multer = require('multer');
const Product = require('../model/product.model');
const auth = require('../middleware/auth.middleware');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); // Required to handle stream with multer memoryStorage

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const productrouter = express.Router();

// Get all products or filter by user role
productrouter.get('/', auth('admin', 'seller', 'buyer'), async (req, res) => {
    try {
        let products;
        if (req.user.role === "admin" || req.user.role === "buyer") {
            products = await Product.find();
        } else {
            products = await Product.find({ sellerId: req.user.id });
        }
        res.status(200).send({ "products": products });
    } catch (error) {
        console.log(error);
        res.status(400).send({ "error": error });
    }
});

// Search products with filters
productrouter.get('/search', auth('admin', 'seller', 'buyer'), async (req, res) => {
    let { name, min, max, page = 1, limit = 10, order = "asc", sortby, Category } = req.query;
    try {
        let query = {};
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        if (Category) {
            query.Category = { $regex: Category, $options: 'i' };
        }
        if (min && max) {
            query.price = { $gte: min, $lte: max };
        }

        let sortquery = {};
        if (sortby) {
            sortquery[sortby] = order === "asc" ? 1 : -1;
        }

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const products = await Product.find(query).sort(sortquery).skip(skip).limit(limit);
        res.status(200).send({ "products": products });
    } catch (error) {
        console.log(error);
        res.status(400).send({ "error": error });
    }
});

// Get product by ID
productrouter.get('/:id', auth('admin', 'seller', 'buyer'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.status(200).send({ "product": product });
    } catch (error) {
        console.log(error);
        res.status(400).send({ "error": error });
    }
});

// Add a product
productrouter.post('/add', auth('admin', 'seller'), upload.single('image'), async (req, res) => {
    const { name, description, price, quantity } = req.body;

    if (!name || !price || !quantity) {
        return res.status(400).send({ message: "Please enter all required fields" });
    }

    if (!req.file) {
        return res.status(400).send({ message: "Please upload an image" });
    }

    try {
        // Cloudinary upload using streamifier
        let stream =  cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Image upload failed" });
            }

            const product = new Product({
                name,
                image: result.secure_url,
                description,
                price,
                quantity,
                sellerId: req.user.id
            });

            await product.save();
            res.status(200).send({ message: "Product added successfully", product });
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Product not added", error });
    }
});

// Update a product
productrouter.patch('/update/:id', auth('admin', 'seller'), upload.single('image'), async (req, res) => {
    const { name, description, price, quantity } = req.body;
    const id = req.params.id;

    if (!name && !description && !price && !quantity && !req.file) {
        return res.status(400).send({ message: "Please provide fields to update" });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        if (req.user.role !== 'admin' && product.sellerId !== req.user.id) {
            return res.status(403).send({ message: "You are not authorized to update this product" });
        }
        
        // If a new image is uploaded, update it
        if (req.file) {
            let stream = cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Image upload failed" });
                }

                const updatedProduct = await Product.findByIdAndUpdate(id, {
                    name: name || product.name,
                    image: result.secure_url,
                    description: description || product.description,
                    price: price || product.price,
                    quantity: quantity || product.quantity
                }, { new: true });

                res.status(200).send({ message: "Product updated successfully", updatedProduct });
            });

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        } else {
            // Update without changing the image
            const updatedProduct = await Product.findByIdAndUpdate(id, {
                name: name || product.name,
                description: description || product.description,
                price: price || product.price,
                quantity: quantity || product.quantity
            }, { new: true });

            res.status(200).send({ message: "Product updated successfully", updatedProduct });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Product not updated", error });
    }
});


// Delete a product
productrouter.delete('/delete/:id', auth('admin', 'seller'), async (req, res) => {
    const id = req.params.id;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        if (req.user.role !== 'admin' && product.sellerId !== req.user.id) {
            return res.status(403).send({ message: "You are not authorized to delete this product" });
        }

        await Product.findByIdAndDelete(id);
        res.status(200).send({ message: "Product deleted successfully", product });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Product not deleted", error });
    }
});

module.exports = productrouter;

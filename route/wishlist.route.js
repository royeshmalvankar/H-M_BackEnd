// const express = require('express')
// const Product = require('../model/product.model')
// const auth = require('../middleware/auth.middleware')
// const Wishlist = require('../model/wishlist.model')

// const wishListrouter = express.Router()


// wishListrouter.get('/',auth('admin','buyer'), async(req, res) => {
//     try {
//         const wishList = await Wishlist.find({userId:req.user.id}).populate('products',{quantity:0})
//         res.status(200).send({"wishList":wishList})
//     } catch (error) {
//         console.log(error);
//         res.status(400).send({"error":error})
//     }
// })

// wishListrouter.post('/add/:id', auth('admin', 'buyer'), async (req, res) => {
//     const { id } = req.params;
//     const product = await Product.findById(id);

    
//     try {
//         if (!product) {
//             return res.status(400).send({ message: "Product not found" });
//         }

//         let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('products', { quantity: 0 });
        
//         if (wishlist) {
//             // Add only the product ID to the array
//             wishlist.products.push(product);
//             wishlist.totalwishListValue =wishlist.products.reduce((total, item) => total + item.price, 0)
//             await wishlist.save();
//             return res.status(200).send({ message: "Wishlist updated successfully", Wishlist: wishlist });
//         }

//         // If wishlist doesn't exist, create a new one
//         wishlist = new Wishlist({
//             userId: req.user.id,
//             products: product,  // Save the product ID, not the full product object
//             totalwishListValue: product.price
//         });
//         await wishlist.save();
//         res.status(200).send({ message: "Wishlist added successfully", Wishlist: wishlist });
//     } catch (error) {
//         console.error(error);
//         res.status(400).send({ message: "Wishlist not added", error });
//     }
// });

// wishListrouter.delete('/delete/:id', auth('admin', 'buyer'), async (req, res) => {
//     const { id } = req.params;
    
//     try {
//         const wishlist = await Wishlist.findOne({ userId: req.user.id });
        
//         if (!wishlist) {
//             return res.status(400).send({ message: "Wishlist not found" });
//         }

//         const index = wishlist.products.findIndex((productId) => productId.equals(id));
//         if (index === -1) {
//             return res.status(404).send({ message: "Product not found in wishlist" });
//         }

//         // Remove product and update the total wishlist value
//         const product = await Product.findById(id);
//         wishlist.products.splice(index, 1);
//         wishlist.totalwishListValue -= product.price;
//         await wishlist.save();

//         res.status(200).send({ message: "Product removed from wishlist", Wishlist: wishlist });
//     } catch (error) {
//         console.error(error);
//         res.status(400).send({ message: "Failed to remove product from wishlist", error });
//     }
// });



// module.exports = wishListrouter

const express = require('express');
const Product = require('../model/product.model');
const auth = require('../middleware/auth.middleware');
const Wishlist = require('../model/wishlist.model');

const wishListrouter = express.Router();

// Get Wishlist
wishListrouter.get('/', auth('admin', 'buyer'), async (req, res) => {
    try {
        const wishList = await Wishlist.find({ userId: req.user.id }).populate('products', { quantity: 0 });
        res.status(200).send({ wishList });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error });
    }
});

// Add to Wishlist
wishListrouter.post('/add/:id', auth('admin', 'buyer'), async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(400).send({ message: "Product not found" });
        }

        let wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (wishlist) {
            // Check if the product is already in the wishlist
            const productExists = wishlist.products.some((productId) => productId.equals(product._id));
            if (productExists) {
                return res.status(400).send({ message: "Product already in wishlist" });
            }

            // Add product to wishlist
            wishlist.products.push(product._id);
            wishlist.totalwishListValue += product.price;
            await wishlist.save();

            return res.status(200).send({ message: "Wishlist updated successfully", Wishlist: wishlist });
        }

        // Create a new wishlist
        wishlist = new Wishlist({
            userId: req.user.id,
            products: [product._id],  // Save only product ID
            totalwishListValue: product.price
        });
        await wishlist.save();

        res.status(200).send({ message: "Wishlist created successfully", Wishlist: wishlist });
    } catch (error) {
        console.error(error);
        res.status(400).send({ message: "Failed to add product to wishlist", error });
    }
});

// Remove from Wishlist
wishListrouter.delete('/delete/:id', auth('admin', 'buyer'), async (req, res) => {
    const { id } = req.params;
    
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (!wishlist) {
            return res.status(400).send({ message: "Wishlist not found" });
        }

        const index = wishlist.products.findIndex((productId) => productId.equals(id));
        if (index === -1) {
            return res.status(404).send({ message: "Product not found in wishlist" });
        }

        // Remove the product from wishlist
        const product = await Product.findById(id);
        wishlist.products.splice(index, 1);
        wishlist.totalwishListValue -= product.price;
        await wishlist.save();

        res.status(200).send({ message: "Product removed from wishlist", Wishlist: wishlist });
    } catch (error) {
        console.error(error);
        res.status(400).send({ message: "Failed to remove product from wishlist", error });
    }
});

module.exports = wishListrouter;

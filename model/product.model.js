const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: { 
        data: Buffer, 
        type: String
    },
    description: {
        type: String
    },
    Category: {
        type: String
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

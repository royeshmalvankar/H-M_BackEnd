const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }],
    totalCartValue: {
        type: Number,
        required: true,
    },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart
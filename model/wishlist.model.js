const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }],
    totalwishListValue: {
        type: Number,
        default: 0,
        required: true,
    },
});

const Wishlist= mongoose.model("Wishlist", wishListSchema);

module.exports = Wishlist
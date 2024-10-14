const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 12,
    },
    role: {
        type: String,
        enum: ["admin","buyer","seller"],
        default: "buyer",
        required: true,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
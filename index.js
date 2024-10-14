const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./dbs/db");
const userrouter = require("./route/user.route");
const productrouter = require("./route/product.route");
const cartrouter = require("./route/cart.route");
const wishListrouter = require("./route/wishlist.route");
require("dotenv").config();
const cloudinary = require('cloudinary').v2;


app.use(express.json());
app.use(cors({
    origin: "*",
}))

app.use("/user",userrouter)
app.use("/product",productrouter)
app.use("/cart",cartrouter)
app.use("/wishlist",wishListrouter)

const port=process.env.PORT || 3000


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    connectDB();
    console.log(`Server started on port ${port}`);
});
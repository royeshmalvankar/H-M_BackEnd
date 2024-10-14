const express = require('express')
const Cart = require('../model/cart.model')
const Product = require('../model/product.model')
const auth = require('../middleware/auth.middleware')

const cartrouter = express.Router()

cartrouter.get('/',auth('admin','buyer'), async(req, res) => {
    try {
        const carts = await Cart.find({buyerId:req.user.id}).populate('products',{quantity:0})
        res.status(200).send({"carts":carts})
    } catch (error) {
        console.log(error);
        res.status(400).send({"error":error})
    }
})

cartrouter.post('/add/:id',auth('admin','buyer'), async(req, res) => {
    const {id} = req.params
    const product = await Product.findById(id) 
    
    const cartCheck = await Cart.findOne({buyerId:req.user.id}).populate('products',{quantity:0})

    try {
        if(!product) 
            {
                return res.status(400).send({message:"product not found"})
            }
         if(cartCheck)
        {
            cartCheck.products.push(product)
            cartCheck.totalCartValue = cartCheck.products.reduce((total, item) => total + item.price, 0)
            cartCheck.save()
            return res.status(200).send({message:"cart added successfully","cart":cartCheck})
         }

        const cart = new Cart({
            buyerId:req.user.id,
            products:product,
            totalCartValue:product.price
        })
        cart.save()
        res.status(200).send({message:"cart added successfully","cart":cart})
    } catch (error) {
        console.log(error);
        res.status(400).send({message:"cart not added","error":error})    
    }
})

cartrouter.delete('/delete/:id',auth('admin','buyer'), async(req, res) => {
    const {id} = req.params
    try {
        const cart = await Cart.findOne({buyerId:req.user.id}).populate('products',{quantity:0})
        if(!cart)
        {
            return res.status(400).send({message:"cart not found"})
        }
        const product = cart.products
        const index = product.findIndex((item) => item._id == id)
        
        product.splice(index,1)
        cart.totalCartValue = cart.products.reduce((total, item) => total + item.price, 0)
        cart.save()
        res.status(200).send({message:"cart deleted successfully","cart":cart})
    } catch (error) {
        console.log(error);
        res.status(400).send({message:"cart not deleted","error":error})
    }
})


module.exports = cartrouter
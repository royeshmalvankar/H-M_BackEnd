const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth.middleware')
const User = require('../model/user.model')
const Blacklist = require('../model/blacklist.model')

const userrouter = express.Router()

userrouter.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please enter all fields' })
    }
    try {
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ error: 'User already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        })
        const userSaved = await newUser.save()
        res.status(200).json({ message: "User registered successfully", user: userSaved.name })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

userrouter.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter all fields' })
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: 'User does not exist please register' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }
        const acessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })
        const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(200).json({ message: "User logged in successfully", acessToken, refreshToken, userid: user._id })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

userrouter.post('/refreshToken', async (req, res) => {
    const refreshToken = req.body.refreshToken
    if (!refreshToken) {
        return res.status(400).json({ error: 'Please provide a refresh token' })
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
        const acessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.status(200).json({ message: "Token refreshed successfully", acessToken })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

userrouter.get('/logout',auth('admin','buyer','seller'),  (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]
    const Black = new Blacklist({ token })
     Black.save()
    res.status(200).json({ message: "User logged out successfully" })
})

userrouter.get('/userid',auth('admin','buyer','seller'), async (req, res) => {
    try {
        const users = await User.find(req.user.role == "admin" ? {} : { _id: req.user.id }, "-password")
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

userrouter.get('/:id',auth('admin','buyer','seller'), async (req, res) => {
    const id = req.params.id
    try {
        if(req.user.id == id){
        const users = await User.findById(id, "-password")
        res.status(200).json(users)
        }
        else{
            res.status(400).json({ error: "Profile Only api endpoint" })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

userrouter.delete('/delete/:id',auth('admin'), async (req, res) => {
    const id = req.params.id
    try {
        const users = await User.findByIdAndDelete(id)
        res.status(200).json(users,"User deleted successfully")
    } catch (error) {
        res.status(500).json({ error: error.message,msg:"User not deleted" })
    }
})

userrouter.patch('/update/:id',auth('admin'), async (req, res) => {
    const id = req.params.id
    const { name, email, password, role } = req.body
    if (req.body == null) {
        return res.status(400).json({ error: 'Please enter fields' })
    }
    try {
        const users = await User.findByIdAndUpdate(id, {
            name,
            email,
            password,
            role
        })
        res.status(200).json(users,"User updated successfully")
    } catch (error) {
        res.status(500).json({ error: error.message,msg:"User not updated" })
    }
})


module.exports = userrouter
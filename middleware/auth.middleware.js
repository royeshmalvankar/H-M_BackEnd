const jwt = require('jsonwebtoken')
const Blacklist = require('../model/blacklist.model')

const auth = (...role) => async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {

        return res.status(401).send({ error: 'login first' })
    }
    const Black = await Blacklist.findOne({ token })
    if (Black) {
        return res.status(401).send({ error: 'Token blacklisted, login again' })
    }
   try {
     const decoded = jwt.verify(token, process.env.JWT_SECRET)
     if (!decoded) {
         return res.status(401).send({ error: 'Unauthorized user' })
     }
     req.user = decoded
     
     if (role.includes(decoded.role))
        {
            
            next()
        } 
    else {
         return res.status(401).send({ error: 'Unauthorized role' })
        }
   } catch (error) {
    console.log(error)
    return res.status(401).send({ error: 'Unauthorized user' });
    // res.redirect('/login')
   }
}

module.exports = auth
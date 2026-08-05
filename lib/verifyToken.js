import jwt from 'jsonwebtoken'
import { configDotenv } from 'dotenv'

configDotenv()

export async function verifyToken(req, res, next) {
    try{
        const token = req.headers['authorization']?.split(' ')[1]
        if(!token){
            return res.status(400).json({ message: 'UnAuthorized' })
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode
        next()
    }catch(err){
        console.log(err)
        return res.status(403).json({ message: 'Forbidden' })
    }
}
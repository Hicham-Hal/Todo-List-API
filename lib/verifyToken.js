import jwt from 'jsonwebtoken'
import { configDotenv } from 'dotenv'

configDotenv()

export async function verifyToken(req, res, next) {
    try{
        console.log('i am here')
        const token = req.headers['authorization']?.split(' ')[1]
        if(!token){
            return res.status(400).json({ error: 'Access denied' })
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode
        next()
    }catch(err){
        console.log(err)
        return res.status(403).json({ error: 'Invalid token' })
    }
}
import User from "../models/User.model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { configDotenv } from "dotenv";

configDotenv()

export const register = async(req, res) => {
    const { name, email, password } = req.body;
    const saltRounds = 12

    try{
        const user = await User.findOne({ email })
        if(user) return res.status(409).json({ msg: 'User already exist with that email' })
        
        const salt = await bcrypt.genSaltSync(saltRounds)
        const genPwd = await bcrypt.hashSync(password, salt)

        const newUser = new User({
            name,
            email,
            password: genPwd
        })

        await newUser.save()
        
        const accessToken = jwt.sign({id: newUser._id, email: newUser.email}, process.env.ACCESS_JWT_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        
        return res.status(201).json({accessToken})
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const login = async(req, res) => {
    const {email, password} = req.body

    try{
        const user = await User.findOne({ email })
        if(!user) return res.status(401).json({ msg: 'Invalid email or password' })
        const pwdCompare = await bcrypt.compareSync(password, user.password)
        if(!pwdCompare) return res.status(401).json({ msg: 'Invalid email or password' })
        
        const accessToken = jwt.sign({id: user._id, email: user.email}, process.env.ACCESS_JWT_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({id: user._id, email: user.email}, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' })
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({accessToken})

        }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}


export const refreshToken = async(req, res) => {
    console.log(req.cookies)
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({ message: 'Refresh token missing' })
    }

    try{
        const refreshData = await jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET)
        const accessToken = await jwt.sign({ id: refreshData.id, email: refreshData.email }, process.env.ACCESS_JWT_SECRET, { expiresIn: '15m' })
        return res.status(200).json(accessToken)
    }catch(err){
        console.log(err)
        return res.status(403).json({ message: 'Forbidden' })
    }
}
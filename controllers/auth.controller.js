import User from "../models/User.model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { configDotenv } from "dotenv";

configDotenv()

export const register = async(req, res) => {
    const { name, email, password } = req.body;
    const saltRounds = 12
    if(!name || !email || !password){
        return res.json(400).json({ msg: 'empty fields' })
    }
    try{
        const user = await User.findOne({ email })
        if(user) return res.status(400).json({ msg: 'User already exist with that email' })
        
        const salt = await bcrypt.genSaltSync(saltRounds)
        const genPwd = await bcrypt.hashSync(password, salt)

        const newUser = new User({
            name,
            email,
            password: genPwd
        })

        await newUser.save()
        return res.status(201).json(newUser)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const login = async(req, res) => {
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({ error: 'Empty fields' })
    }
    try{
        const user = await User.findOne({ email })
        if(!user) return res.status(404).json({ msg: 'No user with that email' })
        const pwdCompare = await bcrypt.compareSync(password, user.password)
        if(!pwdCompare) return res.status(404).json({ msg: 'Wrong credentials, please try again' })
        const token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET, { expiresIn: '24h' })
        return res.status(200).json(token)
        }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}
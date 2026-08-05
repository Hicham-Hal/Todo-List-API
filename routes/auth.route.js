import express from "express";
import { login, register, refreshToken } from "../controllers/auth.controller.js";

const route = express.Router()

route.post('/register', register)
route.post('/login', login)
route.post('/refresh-token', refreshToken)


export default route
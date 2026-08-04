import express from "express";
import { addTodo, deleteTodo, getSingleTodo, getTodos, updateTodo } from "../controllers/user.controller.js";
import { verifyToken } from "../lib/verifyToken.js";

const route = express.Router()

route.get('/hh', verifyToken, (req, res) => {
    return res.json("hello")
})
route.post('/', verifyToken, addTodo)
route.put('/:id', verifyToken, updateTodo)
route.get('/', verifyToken, getTodos)
route.get('/:id', verifyToken, getSingleTodo)
route.delete('/:id', verifyToken, deleteTodo)


export default route
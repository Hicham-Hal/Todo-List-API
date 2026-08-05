import express from "express";
import { addTodo, deleteTodo, getSingleTodo, getTodos, updateTodo } from "../controllers/user.controller.js";
import { verifyToken } from "../lib/verifyToken.js";
import Todo from "../models/Todo.model.js";
import { paginatedResults } from "../lib/pagination.js";
import { createTodoValidator, getTodosValidator, todoIdValidator, updateTodoValidator } from "../validators/todo.validator.js";
import { validate } from "../validators/validate.js";

const route = express.Router()

route.get('/hh', verifyToken, (req, res) => {
    return res.json("hello")
})
route.post('/', verifyToken, createTodoValidator, validate, addTodo)
route.put('/:id', verifyToken, updateTodoValidator, validate, updateTodo)
route.get('/', verifyToken, getTodosValidator, validate, paginatedResults(Todo), getTodos)
route.get('/:id', verifyToken, todoIdValidator, validate, getSingleTodo)
route.delete('/:id', verifyToken, todoIdValidator, validate, deleteTodo)


export default route
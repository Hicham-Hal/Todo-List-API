import { paginatedResults } from "../lib/pagination.js"
import Todo from "../models/Todo.model.js"

export const addTodo = async(req, res) => {
    const { title, description } = req.body

    try{
        const userId = req.user.id
        const todo = new Todo({
            title,
            description,
            user: userId
        })

        await todo.save()
        return res.status(201).json(todo)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const updateTodo = async(req, res) => {
    const {id} = req.params
    const {title, description} = req.body

    try{
        const todo = await Todo.findOne({ _id: id })
        if(!todo) return res.status(404).json({ msg: 'Todo not found' })
        if(todo.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
        todo.title = title;
        todo.description = description
        await todo.save()
        return res.status(200).json(todo)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const getTodos = async(req, res) => {
    try{
        const data = res.paginatedResults
        console.log(data)
        return res.status(200).json(data)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const getSingleTodo = async(req, res) => {
    const {id} = req.params
    try{
        const todo = await Todo.findOne({ _id: id })
        if(!todo) return res.status(404).json({ error: 'todo not found' })
        if(todo.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
        return res.status(200).json(todo)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const deleteTodo = async(req, res) => {
    const { id } = req.params
    try{
        const todo = await Todo.findById(id)
        if(!todo) return res.status(404).json({ msg: 'todo not found' })
        if(todo.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
        
        await todo.deleteOne()    
        return res.status(204).send()
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}
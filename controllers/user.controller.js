import Todo from "../models/Todo.model.js"

export const addTodo = async(req, res) => {
    const { title, description } = req.body
    if(!title || !description){
        return res.status(400).json({ error: 'Empty fields' })
    }
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
    if(!title || !description){
        return res.status(400).json({ error: 'Empty fields' })
    }
    try{
        const todo = await Todo.findOne({ _id: id, user: req.user.id })
        if(!todo) return res.status(404).json({ msg: 'Todo not found' })
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
        const userId = req.user.id
        const todos = await Todo.find({ user: userId })
        if(!todos) return res.status(400).json({ msg: 'Todos not found' })
        return res.status(200).json(todos)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const getSingleTodo = async(req, res) => {
    const {id} = req.params
    const userId = req.user.id
    try{
        const todo = await Todo.findOne({ _id: id, user: userId })
        if(!todo) return res.status(400).json({ error: 'todo not found' })
        return res.status(200).json(todo)
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

export const deleteTodo = async(req, res) => {
    const { id } = req.params
    try{
        const todo = await Todo.findOneAndDelete({ _id: id })
        if(!todo) return res.status(400).json({ msg: 'todo not found' })
        return res.status(204).json({ msg: 'successfully deletd' })
    }catch(err){
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}
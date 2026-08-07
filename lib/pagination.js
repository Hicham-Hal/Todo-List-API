export const paginatedResults = (Todo) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        console.log(page)
        const limit = parseInt(req.query.limit) || 10;
        const { term } = req.query

        const filter = term
            ? { user: req.user.id, title: {$regex: term, $options: 'i'} }
            : { user: req.user.id }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit

        const results = {}
        
        try{
            results.data = await Todo.find(filter).limit(limit).skip(startIndex).sort({ createdAt: -1 }).exec()
            results.page = page;
            results.limit = limit;
            results.total = await Todo.countDocuments()
            res.paginatedResults = results
            next()
        }catch(err){
            console.log(err)
            return res.status(500).json({ error: 'Something went wrong' })
        }
    }
}
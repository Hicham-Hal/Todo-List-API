export const paginatedResults = (Todo) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const { term } = req.query

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit

        const results = {}
        
        try{
            if(term){
                results.data = await Todo.find({
                    user: req.user.id,
                    title: {$regex: term, $options: 'i'}
                })
                    .limit(limit)
                    .skip(startIndex)
                    .sort({ createdAt: -1 })
                    .exec()
            }else{
                results.data = await Todo.find({ user: req.user.id }).limit(limit).skip(startIndex).sort({ createdAt: -1 }).exec()
            }
            results.page = page;
            results.limit = limit;
            results.total = results.data.length
            res.paginatedResults = results
            next()
        }catch(err){
            console.log(err)
            return res.status(500).json({ error: 'Something went wrong' })
        }
    }
}
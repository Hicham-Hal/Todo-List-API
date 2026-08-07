
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import { clearTestDb, closeTestDb, connectTestDb } from '../setup.js'
import { createAuthedUser } from '../helpers/auth.helper.js'
 
beforeAll(connectTestDb)
afterEach(clearTestDb)
afterAll(closeTestDb)

async function createTodos(token, count, titlePrefix = 'Todo'){
    for(let i = 1; i <= count; i++){
        await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: `${titlePrefix} ${i}`,
                description: `description ${i}`
            })
    }
}


describe('GET /todos pagination', () => {
    it('defaults to page 1 when no page/limit is given', async() => {
        const {token} = await createAuthedUser()
        const todos = await createTodos(token, 3)

        const res = await request(app).get('/todos').set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body.page).toBe(1)
    })

    it('limits the number of results returned per page', async() => {
        const {token} = await createAuthedUser()
        const todos = await createTodos(token, 5)

        const res = await request(app).get('/todos?page=1&limit=2').set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body.page).toBe(1)
        expect(res.body.limit).toBe(2)
        expect(res.body.data).toHaveLength(2)
    })

    it('returns a different slice of item on page 2', async() => {
        const {token} = await createAuthedUser()
        const todos = await createTodos(token, 5)

        const page1 = await request(app).get(`/todos?page=1&limit=2`).set('Authorization', `Bearer ${token}`)
        const page2 = await request(app).get('/todos?page=2&limit=2').set('Authorization', `Bearer ${token}`)

        const page1Ids = page1.body.data.map(t => t._id)
        const page2Ids = page2.body.data.map(t => t._id)
        
        const overlap = page1Ids.filter(id => page2Ids.includes(id))

        expect(overlap).toHaveLength(0)
    })

    it('rejects an invalid (non-numeric) page value', async() => {
        const {token} = await createAuthedUser();

        const res = await request(app).get('/todos?page=sdf').set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(400)
    })

    it('rejects a limit above the allowed maximum', async() => {
        const {token} = await createAuthedUser();

        const res = await request(app).get('/todos?page=1&limit=1000').set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(400)
    })

    it('only counts/paginates the requester\'s own todos, not other users\'', async() => {
        const userA = await createAuthedUser()
        const userB = await createAuthedUser()
        const userATodos = await createTodos(userA.token, 3, 'A todo')
        const userBTodos = await createTodos(userB.token, 10, 'B todo')

        const res = await request(app).get('/todos?page=1&limit=50').set('Authorization', `Bearer ${userA.token}`)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(3)
        expect(res.body.data.every(t => t.title.startsWith('A todo'))).toBe(true)
    })

    it('total reflects the full matching count, not just the current page size', async() => {
        const {token} = await createAuthedUser()
        const todos = await createTodos(token, 30)

        const res = await request(app).get('/todos?page=1&limit=10').set('Authorization', `Bearer ${token}`)
        
        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(10)
        expect(res.body.total).toBe(30)
    })
})


describe('GET /todos filtring (term)', () => {
    it('filters results by title using the term query param', async() => {
        const { token } = await createAuthedUser()
        await request(app).post('/todos').set('Authorization', `Bearer ${token}`).send({
            title: 'buy groceries',
            description: 'this is the description'
        })
        await request(app).post('/todos').set('Authorization', `Bearer ${token}`).send({
            title: 'Pay bills',
            description: 'this is the description'
        })
        const res = await request(app).get('/todos?term=groceries').set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(1)
        expect(res.body.data[0].title).toBe('buy groceries')
    })

    it('term filtering is case-insensitive', async() => {
        const {token} = await createAuthedUser()
        await request(app).post('/todos').set('Authorization', `Bearer ${token}`).send({
            title: 'Buy Groceries',
            description: 'this is the description'
        })

        const res = await request(app).get('/todos?term=GROCERIES').set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(1)

    })

    it('return an empty list when no todo matches the term', async() => {
        const {token} = await createAuthedUser()
        const todo = await createTodos(token, 2)

        const res = await request(app).get('/todos?term=not-exist').set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(0)
    })
})
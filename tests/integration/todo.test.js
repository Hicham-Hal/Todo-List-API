import request from 'supertest'
import app from '../../app.js'
import { clearTestDb, closeTestDb, connectTestDb } from '../setup.js'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createAuthedUser } from '../helpers/auth.helper.js'

beforeAll(connectTestDb)
afterEach(clearTestDb)
afterAll(closeTestDb)

describe('POST /todos', () => {

    it('create a todo for the authenticated user', async() => {

        const {token} = await createAuthedUser()

        const res = await request(app).post('/todos').set('Authorization', `Bearer ${token}`).send({
            title: 'hello there',
            description: 'ok this is the description'
        })
        
        expect(res.status).toBe(201)
        expect(res.body).toBeDefined()
    })

    it('rejects requests with no auth token', async() => {
        const res = await request(app).post('/todos').send({
            title: 'hello world',
            description: 'this is the description'
        })

        expect(res.status).toBe(401)
    })

    it('reject an empty title', async() => {
        const {token} = await createAuthedUser()
        const res = await request(app).post('/todos').set('Authorization', `Bearer ${token}`).send({
            title: "",
            description: 'this is the description'
        })

        expect(res.status).toBe(400)
    })

    
    it('rejects an empty description', async() => {
        const {token} = await createAuthedUser()
        const res = await request(app).post('/todos').set('Authorization', `Bearer ${token}`).send({
            title: 'hello world',
            description: ''
        })

        expect(res.status).toBe(400)
    })
})

describe('PUT /todos/:id', () => {
    it('returns 403 and does not modify another user\'s todo', async () => {
        const userA = await createAuthedUser()
        const userB = await createAuthedUser()

        const created = await request(app).post('/todos').set('Authorization', `Bearer ${userA.token}`).send({
            title: 'hello world',
            description: 'this is the description'
        })

        const res = await request(app).put(`/todos/${created.body._id}`).set('Authorization', `Bearer ${userB.token}`).send({
            title: 'hello',
            description: 'holla'
        })

        expect(res.status).toBe(403)

        const check = await request(app).get(`/todos/${created.body._id}`).set('Authorization', `Bearer ${userA.token}`)

        expect(check.body.title).toBe('hello world')
    })
})

describe('DELETE /todos/:id', () => {
    it('deletes a todo owned by the requester', async() => {
        const {token} = await createAuthedUser()
        const created = await request(app).post('/todos').set('Authorization', `Bearer ${token}`).send({
            title: 'Hello world',
            description: 'this is the description'
        })
        const res = await request(app).delete(`/todos/${created.body._id}`).set('Authorization', `Bearer ${token}`)
    
        
        expect(res.status).toBe(204)
    })

    it('returns 403 and does NOT delete another user\'s todo', async() => {
        const userA = await createAuthedUser()
        const userB = await createAuthedUser()

        const created = await request(app).post('/todos').set('Authorization', `Bearer ${userA.token}`).send({
            title: 'Hello world',
            description: 'this is the description'
        })

        const deleteRes = await request(app).delete(`/todos/${created.body._id}`).set('Authorization', `Bearer ${userB.token}`)
    
        expect(deleteRes.status).toBe(403)

        const checkRes = await request(app).get(`/todos/${created.body._id}`).set('Authorization', `Bearer ${userA.token}`)

        expect(checkRes.status).toBe(200)
    })
})
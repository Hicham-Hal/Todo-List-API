import request from 'supertest'
import app from '../../app.js'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createAuthedUser } from '../helpers/auth.helper.js'
import { clearTestDb, closeTestDb, connectTestDb } from '../setup.js'


beforeAll(connectTestDb)
afterEach(clearTestDb)
afterAll(closeTestDb)

describe('POST /register', () => {
    it('creates a user and returns an access token', async() => {
        const res = await request(app).post('/register').send({
            name: 'Jane Doe',
            email: 'janedoe@gmail.com',
            password: 'janedoe123'
        })


        expect(res.status).toBe(201)
        expect(res.body.accessToken).toBeDefined()
        expect(res.body.password).toBeUndefined()
    })

    it('rejects an invalid email', async() => {
        const res = await request(app).post('/register').send({
            name: 'Jane Doe',
            email: 'invalid-email',
            password: 'janedoe123'
        })


        expect(res.status).toBe(400)
    })


    it('returns 409 when the email is already registered', async() => {
        const payload = { name: 'Jane Doe', email: 'janedoe@gmail.com', password: 'janedoe123' }
        await request(app).post('/register').send(payload)

        const res = await request(app).post('/register').send(payload)


        expect(res.status).toBe(409)
    })
})


describe('POST /login', () => {

    it('logs in with correct credentials', async() => {
        await createAuthedUser({
            name: 'Jane Doe',
            email: 'janedoe@gmail.com',
            password: 'janedoe123'
        })

        const res = await request(app).post('/login').send({
            email: 'janedoe@gmail.com',
            password: 'janedoe123'
        })

        
        expect(res.status).toBe(200)
        expect(res.body.accessToken).toBeDefined()
    })


    it('returns 401 for wrong password', async() => {

        await createAuthedUser({
            name: 'Jane Doe',
            email: 'janedoe@gmail.com',
            password: 'janedoe123'
        })

        const res = await request(app).post('/login').send({
            email: 'janedoe@gmail.com',
            password: 'fasfdsk'
        })
        
        expect(res.status).toBe(401)

    })

    it('returns 401 for an email that does not exist', async() => {

        const res = await request(app).post('/login').send({
            email: 'email@gmail.com',
            password: 'janedoe123'
        })


        expect(res.status).toBe(401)
    })
})
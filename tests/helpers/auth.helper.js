import app from '../../app.js'
import request from 'supertest'


let counter = 0

export async function createAuthedUser(overrides = {}){
    counter += 1
    const payload = {
        name: `Test user ${counter}`,
        email: `testuser${counter}@gmail.com`,
        password: `password123`,
        ...overrides,
    }

    const res = await request(app).post('/register').send(payload)

    return {
        token: res.body.accessToken,
        email: payload.email,
        rawResponse: res,
    }
}
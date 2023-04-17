process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (name, description) VALUES ('Apple Computer', 'Maker of OSX') RETURNING  id, name, description`);
    testCompany = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", () => {
    test("Get a list with one company", async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ users: [testCompany] })
    })
})

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const res = await request(app).get(`/companies/${testCopmpany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/companies/0`)
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Creates a single company", async () => {
        const res = await request(app).post('/companies').send({ name: 'IBM', description: 'Big Blue' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: expect.any(Number), name: 'IBM', type: 'Big Blue' }
        })
    })
})
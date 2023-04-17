const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT  code, industry_field  FROM industries`, [code]);
        return res.json({ "industries": results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const compResults = await db.query('SELECT name FROM companies WHERE code=$1')
        const indusResults = await db.query(`SELECT  code, industry_field  FROM industries WHERE companies_id=$1`);

        const company = compResults.rows[0];
        company.industry = indusResults.rows;
        return res.json(company)
        //return res.json({ "industries": results.rows })
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        let { code, industry_field } = req.body;

        const results = await db.query('INSERT INTO industries (code, industry_field) VALUES ($1, $2) RETURNING code, industry_field', [code, industry_field]);
        return res.status(201).json({ "idustry": results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

const compResults = await db.query('SELECT ')
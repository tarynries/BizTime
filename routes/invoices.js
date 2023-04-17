const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT  id, comp_code  FROM invoices`);
        return res.json({ "invoices": results.rows })
    } catch (e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params.id;
        const results = await db.query
            (`SELECT 
        i.id, 
        i.comp_code, 
        i.amt, 
        i.paid, 
        i.add_date, 
        i.paid_date, 
        c.name, 
        c.decription 
        FROM invoices AS i INNER JOIN companies as c ON (i.comp_code = c.code)
        WHERE id = $1`,
                [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        const data = result.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
        };

        return res.json({ "invoice": invoice })
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(
            'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, amt, paid, add_date, paid_date', [comp_code, amt]);
        return res.status(201).json({ "invoice": results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        //const { id } = req.params.id;
        let { amt, paid } = req.body;
        let id = req.params.id
        let paidDate = null;

        const currResults = await db.query(
            'SELECT paid FROM invoices WHERE id = $1', [id]);
        //'UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 WHERE id=$3 RETURNING id, comp_code, paid, add_date, paid_date', [id, amt])

        if (currResults.rows.length === 0) {
            throw new ExpressError(`Can't update invoice with id of ${id}`, 404)
        }

        const currPaidDate = currResults.rows[0].paid_date

        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }

        const result = await db.query
            ('UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, paid_date, add_date',
                [amt, paid, paidDate, add_date])

        return res.json({ "invoice": results.rows[0] })
    } catch (e) {
        return next(e)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
        return res.send({ msg: "DELETED!" })
    } catch (e) {
        return next(e)
    }
})


module.exports = router;
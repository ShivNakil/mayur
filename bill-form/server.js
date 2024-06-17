const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL pool setup
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "bill_form_db",
    password: "12345678",
    port: 5432,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS if necessary
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.post('/submit', async (req, res) => {
    const { billNo, date, receiver, items } = req.body;

    try {
        // Check if bill number already exists
        const checkResult = await pool.query('SELECT * FROM bills WHERE bill_no = $1', [billNo]);
        if (checkResult.rows.length > 0) {
            return res.status(409).send('Bill number already exists');
        }

        // Insert into bill table
        const billResult = await pool.query(
            'INSERT INTO bills (bill_no, date, receiver) VALUES ($1, $2, $3) RETURNING id',
            [billNo, date, receiver]
        );
        const billId = billResult.rows[0].id;

        // Insert into bill_items table
        for (let item of items) {
            await pool.query(
                'INSERT INTO bill_items (bill_id, sr_no, particulars, qty, rate, amount) VALUES ($1, $2, $3, $4, $5, $6)',
                [billId, item.srNo, item.particulars, item.qty, item.rate, item.amount]
            );
        }

        res.status(200).send('Bill submitted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Serve bills.html as the bill list page
app.get('/bills-page', (req, res) => {
    res.sendFile(__dirname + '/bills.html');
});

// Endpoint to fetch bill list
app.get('/bills', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.id, b.bill_no, b.receiver, b.date, SUM(bi.amount) AS total_amount
            FROM bills b
            JOIN bill_items bi ON b.id = bi.bill_id
            GROUP BY b.id, b.bill_no, b.receiver, b.date
            ORDER BY b.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).send('Server error');
    }
});

// Endpoint to delete a bill by ID
// Endpoint to delete a bill by ID
app.delete('/bills/:id', async (req, res) => {
    const billId = req.params.id;
    try {
        // Delete related entries in bill_items table first
        await pool.query('DELETE FROM bill_items WHERE bill_id = $1', [billId]);

        // Now delete the bill from bills table
        await pool.query('DELETE FROM bills WHERE id = $1', [billId]);

        res.status(204).send(); // 204 No Content response on successful deletion
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).send('Server error');
    }
});

app.delete('/bills', async(req, res) => {
    await pool.query('DELETE FROM bill_items;');
    await pool.query('DELETE FROM bills;');
    res.status(200).send('All bills deleted');
});


// Endpoint to get a bill by ID
app.get('/bills/:id', async (req, res) => {
    const billId = req.params.id;

    // Ensure billId is a valid integer
    if (!billId || isNaN(parseInt(billId))) {
        return res.status(400).send('Invalid bill ID');
    }

    try {
        // Fetch bill details from bills and related items from bill_items
        const billQuery = await pool.query('SELECT * FROM bills WHERE id = $1', [billId]);
        const bill = billQuery.rows[0];

        if (!bill) {
            return res.status(404).send('Bill not found');
        }

        const billItemsQuery = await pool.query('SELECT * FROM bill_items WHERE bill_id = $1', [billId]);
        const billItems = billItemsQuery.rows;

        const billData = {
            id: bill.id,
            bill_no: bill.bill_no,
            date: bill.date,
            receiver: bill.receiver,
            total_amount: bill.total_amount,
            bill_items: billItems
        };

        res.json(billData);
    } catch (error) {
        console.error('Error fetching bill:', error);
        res.status(500).send('Server error');
    }
});

app.put('/bills/:id', async (req, res) => {
    const billId = req.params.id;
    const { bill_no, date, receiver, bill_items } = req.body;

    try {
        // Update bill details
        await pool.query(
            'UPDATE bills SET bill_no = $1, date = $2, receiver = $3 WHERE id = $4',
            [bill_no, date, receiver, billId]
        );

        // Delete existing bill items
        await pool.query('DELETE FROM bill_items WHERE bill_id = $1', [billId]);

        // Insert new bill items
        const insertItemQuery = 'INSERT INTO bill_items (bill_id, sr_no, particulars, qty, rate, amount) VALUES ($1, $2, $3, $4, $5, $6)';
        for (const item of bill_items) {
            await pool.query(insertItemQuery, [billId, item.sr_no, item.particulars, item.qty, item.rate, item.amount]);
        }

        res.status(200).json({ message: 'Bill updated successfully' });
    } catch (error) {
        console.error('Error updating bill:', error);
        res.status(500).json({ error: 'Failed to update bill' });
    }
});

// Endpoint to fetch receiver name suggestions
app.get('/autocomplete/receivers', async (req, res) => {
    const searchTerm = req.query.q;
    try {
        const result = await pool.query(
            'SELECT DISTINCT receiver FROM bills WHERE receiver ILIKE $1 LIMIT 10',
            [`%${searchTerm}%`]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching receiver suggestions:', error);
        res.status(500).json({ error: 'Failed to fetch receiver suggestions' });
    }
});

// Endpoint to fetch particulars suggestions
app.get('/autocomplete/particulars', async (req, res) => {
    const searchTerm = req.query.q;
    try {
        const result = await pool.query(
            'SELECT DISTINCT particulars FROM bill_items WHERE particulars ILIKE $1 LIMIT 10',
            [`%${searchTerm}%`]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching particulars suggestions:', error);
        res.status(500).json({ error: 'Failed to fetch particulars suggestions' });
    }
});





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

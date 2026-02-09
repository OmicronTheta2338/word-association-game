const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 80;
const DATA_FILE = path.join(__dirname, 'data', 'flags.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize flags file if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// GET Flags
app.get('/api/flags', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read flags' });
        }
        res.json(JSON.parse(data || '[]'));
    });
});

// POST Flag
app.post('/api/flags', (req, res) => {
    const newFlag = req.body;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read flags' });
        }

        const flags = JSON.parse(data || '[]');

        // Check for duplicates
        const exists = flags.some(item => JSON.stringify(item.content) === JSON.stringify(newFlag.content));

        if (!exists) {
            flags.push(newFlag);
            fs.writeFile(DATA_FILE, JSON.stringify(flags, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to save flag' });
                }
                res.json({ success: true, count: flags.length });
            });
        } else {
            res.json({ success: true, message: 'Already flagged', count: flags.length });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./database/university.db');

// GET all courses
app.get('/courses', (req, res) => {
    db.all('SELECT * FROM courses', (err, rows) => {
        res.json(rows);
    });
});

// GET specific course
app.get ('/courses/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
        res.json(row);
    });
});

// POST new course
app.post('/courses', (req, res) => {
    const { courseCode, title, credits, description, semester } = req.body;
    db.run(`
        INSERT INTO courses (courseCode, title, credits, description, semester)
        VALUES (?, ?, ?, ?, ?)
        `,
        [courseCode, title, credits, description, semester],
        function(err) {
            res.json({ id: this.lastID });
        }
    );
});

// PUT update course
app.put('/courses/:id', (req, res) => {
    const id = req.params.id;
    const { courseCode, title, credits, description, semester } = req.body;
    db.run(`
        UPDATE courses SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ? WHERE id = ?
        `,
        [courseCode, title, credits, description, semester, id],
        function(err) {
            res.json({ message: 'Course updated' });
        }
    );
});

// DELETE course
app.delete('/courses/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM courses WHERE id = ?`, [id], function(err) {
        res.json({ message: 'Course deleted' });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

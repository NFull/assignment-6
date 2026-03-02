const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./database/university.db');

const coursesValidation = [
  body('courseCode')
    .isString()
    .notEmpty()
    .withMessage('Course Code must be a string'),

  body('title')
    .isString()
    .notEmpty()
    .withMessage('Title must be a string'),

  body('credits')
    .isInt({ gt: 0 })
    .withMessage('Credits must be a positive integer'),

  body('description')
    .isString()
    .notEmpty()
    .withMessage('Description must be a string'),

  body('semester')
    .isString()
    .notEmpty()
    .withMessage('Semester must be a string')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      error: 'Validation failed',
      messages: errorMessages
    });
  }

  if(req.body.completed === undefined) {
    req.body.completed = false;
  }

  next();
};

const requestLogger = (req, res, next) => {
  const timeStamp = new Date().toISOString();
  console.log(`[${timeStamp}] ${req.method} ${req.originalUrl}`)

  if(req.method === 'POST' || req.method === 'PUT') {
    console.log("Request Body", JSON.stringify(req.body, null, 2))
  }

  next();
};

app.use(requestLogger);

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
app.post('/courses', coursesValidation, handleValidationErrors, (req, res) => {
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
app.put('/courses/:id', coursesValidation, handleValidationErrors, (req, res) => {
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

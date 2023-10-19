const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');//session handling 
const uuid = require('uuid');//token 
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
// ---------------------
const secret_key = '4138f1f804824b74562da28ee6548cacdbaa8f3c73bf879f32686725f329c08122f8bfffad945b9d0ad565057e007dde7dfbaef59cf38c3b8067be05bb28c4ef';
app.use(session({ secret: secret_key, resave: false, saveUninitialized: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'secookie',
});



db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');
});

app.get('/', (req, res) => {
    res.redirect('/login')
});
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/dashboard.html');
      } else {
        res.redirect('/login'); 
      }
 });
app.get('/register', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(__dirname + '/registration.html');
    }
});
// Registration route
app.post('/register', (req, res) => {
    if (req.session.user) {

        res.redirect('/dashboard');
    } else {
        const { username, password } = req.body;
        const token = uuid.v4(); 

        const user = { username, password, token };

        db.query('INSERT INTO users SET ?', user, (err) => {
            if (err) throw err;
            console.log('User registered');
            res.redirect('/login'); ``
        });
    }
});
app.get('/login', (req, res,next) => {
    if (req.session.user) {
        res.redirect('/dashboard');
        next();
    } 
    else {
        res.sendFile(__dirname + '/login.html');
    } 
});
// Login route
app.post('/login', (req, res) => {
    if (req.session.user) {
        
        res.redirect('/dashboard');
    } else {
        const { username, password } = req.body;
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                const user = results[0];
                req.session.user = user; 
                res.redirect('/dashboard');
            } else {
                res.redirect('/login');
            }
        });
    }
});

// Dashboard route
app.get('/dashboard',(req, res) => {
    if (req.session.user) {
        res.send('Welcome to the dashboard!');
    } else {
        res.redirect('/login');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login');
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

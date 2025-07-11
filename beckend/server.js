require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const USERS_FILE = 'users.json';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/register', async (req, res) => {
  const { email, firstName, lastName } = req.body;
  const users = loadUsers();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const updated = users.filter(u => u.email !== email);
  updated.push({ email, firstName, lastName, verified: false, code });
  saveUsers(updated);
  await transporter.sendMail({
    to: email,
    subject: "Код подтверждения",
    text: "Ваш код: " + code
  });
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

app.post('/verify', async (req, res) => {
  const { email, code, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.code === code);
  if (!user) return res.send("Неверный код");
  user.password = await bcrypt.hash(password, 10);
  user.verified = true;
  delete user.code;
  saveUsers(users);
  res.redirect('/index.html');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.verified);
  if (!user) return res.send("Пользователь не найден или не подтвержден");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("Неверный пароль");
  req.session.user = user;
  res.redirect('mimaro.vercel.app');
});

app.listen(PORT, () => {
  console.log('Сервер запущен на http://localhost:' + PORT);
});
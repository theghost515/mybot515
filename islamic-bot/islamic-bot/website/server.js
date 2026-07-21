require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const db = require('../shared/db');

const app = express();

// Render يحتاج process.env.PORT
const PORT = process.env.PORT || process.env.WEBSITE_PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

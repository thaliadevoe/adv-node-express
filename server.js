'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const { ObjectID } = require('mongodb');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Setting up pug
app.set('view engine', 'pug');
app.set('views', './views/pug');
//Setting up express-session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
//Setting up passport
app.use(passport.initialize());
app.use(passport.session());


//Connect to DB for authentication
    myDB(async client => {
      const myDataBase = await client.db('database').collection('users');
    
      // The app.route goes here
        app.route('/').get((req, res) => {
            res.render('index', {title: 'Hello', message: 'Please log in'});
        });
        
        //Passport Serialisation
        passport.serializeUser((user, done) => {
          done(null, user._id);
        });
    
        passport.deserializeUser((id, done) => {
          myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
            done(null, doc);
          });
        });
        
      // Error Handling
    }).catch(e => {
      app.route('/').get((req, res) => {
        res.render('index', { title: e, message: 'Unable to connect to database' });
      });
    });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

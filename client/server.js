// server.js
// import { HexString } from 'aptos';
// import express from 'express';
// import next from 'next';
// import path from 'path';
// import mysql from 'mysql2';
// import { fileURLToPath } from 'url';
// import transferLegacyCoin from './pages/api/transfer.cjs';
// // const {transferLegacy} = transferLegacyCoin;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const { HexString } = require('aptos');
const express = require('express');
const next = require('next');
const path = require('path');
const mysql = require('mysql2');
const transferLegacyCoin = require('./pages/api/transfer.cjs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(async() => {
  const server = express();
  
  
  // Middleware to parse URL-encoded bodies
  server.use(express.urlencoded({ extended: true }));

  // Middleware to parse JSON bodies (optional if you plan to send JSON)
  server.use(express.json());

  // Connect to MySQL
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'mydb'
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
  });

  // Set EJS as the view engine
  server.set('view engine', 'ejs');
  server.set('views', path.join(__dirname, 'pages', 'views')); // Adjust path if needed

  // Serve the EJS index page at the root URL
  server.get('/', (req, res) => {
    res.render('index'); // This should match your index.ejs file
  });

  server.post('/investor', (req, res) => {
    res.render('investor');
  });

  server.post('/company', (req, res) => {
    res.render('company');
  });

  server.post('/isignin', (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).send("Invalid Input");
    }

    connection.query('SELECT name, returnamount FROM investor WHERE name = (?) AND password = (?)', [name, password], (err, results) => {
      if (err) throw err;

      connection.query('SELECT name, email, contactno, funding, pitch, fr FROM company', (err, result2) => {
        if (err) throw err;
        const resultsforcompanytable = result2;

        if (results.length > 0) {
          const resultsforinvestortable = results[0];
          console.log("RESULT RESULT");
          console.log(resultsforinvestortable);
          res.render('idashboard', { resultsforinvestortable, resultsforcompanytable });
        } else {
          res.redirect('/');
          console.log("Wrong credentials.");
        }
      });
    });
  });

  server.post('/isignup', (req, res) => {
    const { name, password, confirmpassword, email, contactno, tinno } = req.body;
    console.log(name, password, confirmpassword);
    if (!name || !password || !confirmpassword || !email || !contactno || !tinno) {
      return res.status(400).send("Invalid Input");
    }
    if (password === confirmpassword) {
      connection.query('INSERT INTO investor(name, password, email, contactno, tinno) VALUES(?,?,?,?,?)', [name, password, email, contactno, tinno], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error inserting user');
        }

        connection.query('SELECT name, returnamount FROM investor WHERE name = (?) AND password = (?)', [name, password], (err, results) => {
          if (err) throw err;

          connection.query('SELECT name, email, contactno, funding, pitch, fr FROM company', (err, result2) => {
            if (err) throw err;
            const resultsforcompanytable = result2;

            if (results.length > 0) {
              const resultsforinvestortable = results[0];
              console.log("RESULT RESULT");
              console.log(resultsforinvestortable);
              res.render('idashboard', { resultsforinvestortable, resultsforcompanytable });
            } else {
              res.redirect('/');
              console.log("Wrong credentials.");
            }
          });
        });
      });
    }
  });

  server.post('/csignin', (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).send("Invalid Input");
    }

    connection.query('SELECT * FROM company WHERE name = (?) AND password = (?)', [name, password], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const fr = results[0].fr;
        const funding = results[0].funding;
        let message = "Complete funding not received yet.";
        if (fr >= funding) {
          message = "Complete funding received";
        }

        res.render('cdashboard', { name, funding, fr, message });
      } else {
        res.render('company');
        console.log("Wrong credentials.");
      }
    });
  });

  server.post('/csignup', (req, res) => {
    const { name, password, confirmpassword, email, contactno, funding, pitch } = req.body;
    console.log(name, password, confirmpassword);
    if (!name || !password || !confirmpassword || !email || !contactno || !funding || !pitch) {
      return res.status(400).send("Invalid Input");
    }
    if (password === confirmpassword) {
      connection.query('INSERT INTO company(name, password, email, contactno, funding, pitch) VALUES(?,?,?,?,?,?)', [name, password, email, contactno, funding, pitch], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error inserting user');
        }

        const fr = 0;
        let message = "Complete funding not received yet.";
        if (fr >= funding) {
          message = "Complete funding received";
        }
        res.render('cdashboard', { name, funding, fr, message });
      });
    }
  });

  const performTransaction = async (amount) => {
    console.log(`Initiating transaction for ${amount} coins on Aptos Testnet`);
    
    // The private key should be a hex string without the '0x' prefix
    const privateKeyHex = '876d73c65dc7696c6fd4c08e897e91b0c8d0ad8dbada6a40337dc24807ca2206'; 
    
    const toAddress = '0x87da5a2173900dc609ff269f5209d03998796c1d2d4a4224303d846a36d9b954';   //karan wallet address
    console.log("Recipient address:", toAddress);

    try {
        const txHash = await transferLegacyCoin(privateKeyHex, toAddress, amount);
        console.log(`Transaction successful on Testnet. Hash: ${txHash}`);
        return txHash;
    } catch (error) {
        console.error('Transaction failed on Testnet:', error);
        throw error;
    }
}

  server.post('/invest',(req,res)=>{
    const amount=req.body;
    console.log(amount.invest);
    let investAmount = Number(amount.invest);

    connection.query('UPDATE company SET fr=fr+(?)',[investAmount],(err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Error inserting user');
      };
  });


  performTransaction(investAmount);
  res.redirect('/');
  });


  // Handle other Next.js pages
  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
const mysql = require('mysql2');
const express = require('express');
const qrcode = require('qrcode');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//I am not sure if more middleware is needed...


const db = mysql.createConnection({
    host: 'localhost',
    user: 'userp2',
    password: 'P212345.',
    database: 'mylinks_db'
})

db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database: ' + err.stack);
      return;
    }
    console.log('Connected to the MySQL database.');
  });
  
  const testURLs = [
    {
      siteName: 'just google it',
      siteUrl: 'https://www.google.ca/',
      siteQR: ''
    },
    {
      siteName: 'Slack it up',
      siteUrl: 'https://slack.com/intl/en-in/get-started',
      siteQR: ''
    }
  ];
  
 
  testURLs.forEach((url) => {
    qrcode.toDataURL(url.siteUrl, (err, qrData) => {
      if (err) {
        console.error('Error generating QR code: ' + err);
        return;
      }
      url.siteQR = qrData;
  
     
      db.query('INSERT INTO bookMarks (siteName, siteUrl, siteQR) VALUES (?, ?, ?)', [url.siteName, url.siteUrl, url.siteQR], (err, results) => {
        console.log(url.siteQR);
        if (err) {
          console.error('Error could not add to table: ' + err);
          return;
        }
        
        console.log('success');
      });
    });
  });
  
//   we need to use a query to get the info from the bookmarks and then create the html and we send the html to the endpoint

  app.get('/', (req, res) => {
    let qrHtml = '';
    db.query('SELECT * FROM bookMarks', (err, results) => {
      if (err) {
        console.error('Error retrieving data from bookMarks: ' + err);
        return;
      }
      results.forEach((row) => {
        qrHtml += `<h2>${row.siteName}</h2><img src="${row.siteQR}" alt="QR Code">`;
      });
      res.send(qrHtml);
    });
  });
  
  app.listen(3001, () => {
    console.log('Server running on port 3001');
  });
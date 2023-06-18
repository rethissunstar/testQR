const mysql = require('mysql2');
const express = require('express');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const neighbourhoodlibDb = mysql.createConnection({
  host: 'localhost',
  user: 'userp2',
  password: 'P212345.',
  database: 'neighborhoodlib_db'
});


let reference = '';
let borrowBook = 'http://PCiP/loanApproval/';  //this has to be updated to the heroku site


neighbourhoodlibDb.connect((err) => {
  if (err) {
    console.error('Error connecting to the neighborhoodlib_db: ' + err.stack);
    return;
  }
  console.log('Connected to the neighborhoodlib_db');

  neighbourhoodlibDb.query('SELECT refNum FROM booksout order by refNum DESC LIMIT 1;', (err, results) => {
    if (err) {
      console.error('Error retrieving data from the neighborhoodlib_db: ' + err);
      return;
    }


    if (results.length > 0) {
      reference = results[0].refNum;
    


      qrcode.toFile('./' + JSON.stringify(reference)+'.png', borrowBook + JSON.stringify(reference), {
        errorCorrectionLevel: 'H'
      }, function(err) {
        if (err) throw err;
        console.log('QR code saved!');
      });
    } else {
      console.log('No books found in the neighborhoodlib_db');
    }
  });
  // app.get('/', (req, res) => {
  //   mylinksDb.query('SELECT * FROM bookMarks', (err, results) => {
  //     if (err) {
  //       console.error('Error retrieving data from bookMarks: ' + err);
  //       return res.status(500).send('Internal Server Error');
  //     }
  
  //     let qrHtml = '';
  
  //     results.forEach((row) => {
  //       qrHtml += `<h2>${row.title}</h2><img src="${row.siteQR}" alt="QR Code">`;
  //     });
  
  //     res.send(qrHtml);
  //   });
  // });
});



app.listen(PORT, () => {
  console.log('Server running on port 3001');
});

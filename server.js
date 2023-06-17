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

const mylinksDb = mysql.createConnection({
  host: 'localhost',
  user: 'userp2',
  password: 'P212345.',
  database: 'mylinks_db'
});

let borrowBook = {
  bookTitle: '',
  bookStatus: '',
  bookOwner: '',
  qrCode: ''
};


neighbourhoodlibDb.connect((err) => {
  if (err) {
    console.error('Error connecting to the neighborhoodlib_db: ' + err.stack);
    return;
  }
  console.log('Connected to the neighborhoodlib_db');

  neighbourhoodlibDb.query('SELECT title, bookStatus, bookOwner FROM books', (err, results) => {
    if (err) {
      console.error('Error retrieving data from the neighborhoodlib_db: ' + err);
      return;
    }


    if (results.length > 0) {
      const book = results[0];
      borrowBook.bookTitle = book.title;
      borrowBook.bookStatus = book.bookStatus;
      borrowBook.bookOwner = book.bookOwner;


      qrcode.toDataURL(JSON.stringify(borrowBook), (err, qrData) => {
        if (err) {
          console.error('Error generating QR code: ' + err);
          return;
        }
        borrowBook.qrCode = qrData;

        console.log(borrowBook);

       
        mylinksDb.query('INSERT INTO bookMarks (title, siteQR) VALUES (?, ?)', [borrowBook.bookTitle, borrowBook.qrCode], (err, results) => {
          if (err) {
            console.error('Error inserting data into the mylinks_db: ' + err);
            return;
          }
          console.log('Successfully inserted data into the mylinks_db');
        });
      });
    } else {
      console.log('No books found in the neighborhoodlib_db');
    }
  });
  app.get('/', (req, res) => {
    mylinksDb.query('SELECT * FROM bookMarks', (err, results) => {
      if (err) {
        console.error('Error retrieving data from bookMarks: ' + err);
        return res.status(500).send('Internal Server Error');
      }
  
      let qrHtml = '';
  
      results.forEach((row) => {
        qrHtml += `<h2>${row.title}</h2><img src="${row.siteQR}" alt="QR Code">`;
      });
  
      res.send(qrHtml);
    });
  });
});



app.listen(PORT, () => {
  console.log('Server running on port 3001');
});

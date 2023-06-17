const mysql = require('mysql2');
const express = require('express');
const qrcode = require('qrcode');

const app = express();

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

// Connect to the neighborhoodlib_db
neighbourhoodlibDb.connect((err) => {
  if (err) {
    console.error('Error connecting to the neighborhoodlib_db: ' + err.stack);
    return;
  }
  console.log('Connected to the neighborhoodlib_db');

  // Query the database to get the values
  neighbourhoodlibDb.query('SELECT title, bookStatus, bookOwner FROM books', (err, results) => {
    if (err) {
      console.error('Error retrieving data from the neighborhoodlib_db: ' + err);
      return;
    }

    // Check if there are any results
    if (results.length > 0) {
      const book = results[0]; // Assuming you want to retrieve the first book from the results
      borrowBook.bookTitle = book.title;
      borrowBook.bookStatus = book.bookStatus;
      borrowBook.bookOwner = book.bookOwner;

      // Generate QR code
      qrcode.toDataURL(JSON.stringify(borrowBook), (err, qrData) => {
        if (err) {
          console.error('Error generating QR code: ' + err);
          return;
        }
        borrowBook.qrCode = qrData;

        // Print the borrowBook object with the retrieved values
        console.log(borrowBook);

        // Insert borrowBook into mylinks_db
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
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});

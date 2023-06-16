
CREATE DATABASE mylinks_db;
USE mylinks_db;

CREATE TABLE bookMarks (
    siteId INT AUTO_INCREMENT PRIMARY KEY,
    siteName VARCHAR(255),
    siteUrl VARCHAR(255),
    siteQR TEXT
);


var sqlite3 = require("sqlite3").verbose();
var md5 = require("md5");

const DBSOURCE = "db.sqlite";

const db = new sqlite3.Database(DBSOURCE, err => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log("Connected to the SQlite database.");
        db.run(
            `CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
            err => {
                if (err) {
                    // Table already created
                } else {
                    // Table just created, creating some rows
                    var insert =
                        "INSERT INTO user (name, email, password) VALUES (?,?,?)";
                    db.run(insert, [
                        "admin",
                        "admin@example.com",
                        md5("admin123456")
                    ]);
                    db.run(insert, [
                        "user",
                        "user@example.com",
                        md5("user123456")
                    ]);
                }
            }
        );
        db.run(
            `CREATE TABLE Events (
                id integer NOT NULL CONSTRAINT id PRIMARY KEY,
                date datetime NOT NULL,
                description text NOT NULL,
                loc_lat float NOT NULL,
                loc_long float NOT NULL
            )`,
            err => {
                if (err) {
                    // console.log("events table error", err);
                } else {
                    // Table just created, creating some rows
                    var insert =
                        "INSERT INTO Events (date, description, loc_lat, loc_long) VALUES (?,?,?,?)";
                    db.run(insert, [
                        Date.now(),
                        "Hello world this is a description",
                        "33.333",
                        "32.3333"
                    ]);
                    db.run(insert, [
                        Date.now(),
                        "Hello world this is a description number 2",
                        "23.333",
                        "12.3333"
                    ]);
                }
            }
        );

        db.run(
            `CREATE TABLE Galleries (
                id integer NOT NULL CONSTRAINT Galleries_pk PRIMARY KEY AUTOINCREMENT,
                name text NOT NULL UNIQUE
            )`,
            err => {
                if (err) {
                } else {
                    // Table just created, creating some rows
                    var insert = "INSERT INTO Galleries (name) VALUES (?)";
                    db.run(insert, ["1.jpg"]);
                    db.run(insert, ["2.jpg"]);
                }
            }
        );
    }
});

module.exports = db;

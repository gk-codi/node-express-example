// var express = require("express")
import express from "express";
var app = express();
var db = require("./database.js");
var md5 = require("md5");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000;

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});
app.use(express.static("public"));

app.get("/api/users", (req, res, next) => {
    var sql = "select * from user";
    var params = [];
    db.all(sql, params, (err, users) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: users
        });
    });
});

app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where id = ?";
    var params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: row
        });
    });
});

app.post("/api/user/", (req, res, next) => {
    var errors = [];
    if (!req.body.password) {
        errors.push("No password specified");
    }
    if (!req.body.email) {
        errors.push("No email specified");
    }
    if (errors.length) {
        res.status(400).json({ error: errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password)
    };
    var sql = "INSERT INTO user (name, email, password) VALUES (?,?,?)";
    var params = [data.name, data.email, data.password];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: data,
            id: this.lastID
        });
    });
});

app.patch("/api/user/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password ? md5(req.body.password) : undefined
    };
    db.run(
        `UPDATE user set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           password = coalesce(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        (err, result) => {
            if (err) {
                res.status(400).json({ error: res.message });
                return;
            }
            res.json({
                message: "success",
                data: data
            });
        }
    );
});

app.delete("/api/user/:id", (req, res, next) => {
    db.run("DELETE FROM user WHERE id = ?", req.params.id, function(
        err,
        result
    ) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }
        res.json({ message: "deleted", rows: this.changes });
    });
});

// Galleries API's

app.get("/api/galleries", (req, res, next) => {
    var sql = "select * from Galleries WHERE delted= false";
    var params = [];
    db.all(sql, params, (err, galleries) => {
        if (err) {
            res.status(400).json({
                error: err.message
            });
            return;
        }
        const new_galleries = galleries.map(gallery => {
            gallery.name =
                "http://localhost:8000/images/gallery/" + gallery.name;

            return gallery;
        });
        /** /
        let new_galleriess = [];

        for (let i = 0; i < galleries.length; i++) {
            const item = galleries[i];
            item.name = "http://localhost:8000/images/gallery/" + item.name;
            new_galleries.push(item);
        }
        /** */
        res.json({
            message: "success",
            data: new_galleries
        });
    });
});

app.get("/api/galleries/:id", (req, res, next) => {
    var sql = "select * from Galleries where id = ?";
    var params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (row === undefined) {
            res.status(404).json({
                message: "error: Id not found 404",
                data: {}
            });
        }
        row.name = "http://localhost:8000/images/gallery/" + row.name;
        res.json({
            message: "success",
            data: row
        });
    });
});

app.post("/api/galleries", (req, res, next) => {
    var errors = [];

    if (req.body.name === undefined || req.body.name === "") {
        errors.push("No image name specified");
    }
    if (errors.length) {
        res.status(400).json({ error: errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name
    };
    var sql = "INSERT INTO Galleries (name) VALUES (?)";
    var params = [data.name];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: data,
            id: this.lastID
        });
    });
});

app.patch("/api/galleries/:id", (req, res, next) => {
    var data = {
        name: req.body.name
    };

    // missing code for image upload
    console.log("update galleries 1");
    if (!data.name) {
        console.log("update galleries 2");
        res.json({
            success: false,
            message: "error: please name your file"
        });
    } else {
        var params = [data.name, req.params.id];
        console.log("update galleries 3", params);

        db.run(
            `UPDATE Galleries set 
           name = coalesce(?,name)  
           WHERE id = ?`,
            params,
            (err, result) => {
                if (err) {
                    res.status(400).json({ error: err });
                    return;
                }
                res.json({
                    message: "success",
                    data: data,
                    result
                });
            }
        );
    }
});

app.delete("/api/galleries/:id", (req, res, next) => {
    db.run(
        "UPDATE Galleries SET deleted=true WHERE id = ?",
        req.params.id,
        function(err, result) {
            if (err) {
                res.status(400).json({ error: err });
                return;
            }
            res.json({ message: "deleted", rows: this.changes });
        }
    );
});

// Root path
app.get("/", (req, res, next) => {
    res.json({ message: "Ok" });
});

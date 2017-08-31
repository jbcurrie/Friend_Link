// 3. Your `htmlRoutes.js` file should include two routes:
//    * A GET Route to `/survey` which should display the survey page.
//    * A default, catch-all route that leads to `home.html` which displays the home page. 
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var app = express();
var fs = require('fs');

module.exports = function (app) {

    app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname, "../public","home.html"));
      });

    app.get("/survey2", function(req, res) {
      res.sendFile(path.join(__dirname, "../public","survey2.html"));
    });

    app.get("/style.css", function(req, res) {
      res.sendFile(path.join(__dirname, "../public","style.css"));
    });

    app.get("/script.js", function(req, res) {
      res.sendFile(path.join(__dirname, "../public","script.js"));
    });
}


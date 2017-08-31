var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var dataArr = require("../data/friends.js");
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs');

// `apiRoutes.js` file contain two routes:
//    * A GET route with the url `/api/friends`. used to display a JSON of all possible friends.
//    * A POST routes `/api/friends`. used to handle incoming survey results. This route also handles compatibility logic.
// Routes
// =============================================================
module.exports = function(app) {

    app.use(fileUpload());
    app.use(express.static("/app/public"));
    app.use(express.static("/app/public/images"));

    app.post("/api/clear", function(req,res) {

        // Empty out the arrays of data; replace with starter data\
        //also need to clear out image file and add back .gitignore (or ignore it)
        dataArr = [
            {
            name: "bertie",
            photo: "",
            url: "https://vignette2.wikia.nocookie.net/ttte/images/4/4e/Bertiewithnameboard.png/revision/latest?cb=20140522172007",
            scores: [
                "4",
                "4",
                "4",
                "4",
                "4",
                "4",
                "4",
                "4",
                "4",
                "4"
                ]
            }
        ];
        res.send(true);
    }); 

    app.post("/survey2", function(req,res) {
        
        var temp = JSON.stringify(req.files)
        
        var newFriend = {
            name:req.body.name,
            photo:"",
            url:"",
            scores:[],
            getScores: function() {
              
                //create an arry of the req.body scores
                for (item in req.body.questions) {
                    newFriend.scores.push(req.body.questions[item])
                }   
            },
            getPhoto: function () {
               
                 if (JSON.stringify(req.files) === "{}" && !req.body.url) {
                     newFriend.photo = "";
                     newFriend.url = "http://www.sbsc.in/images/dummy-profile-pic.png";
                 } else if (JSON.stringify(req.files) === "{}" &&  req.body.url) {
                     newFriend.url = req.body.url;
                 } else if (req.files.photo && !req.body.url) {
                     newFriend.photo = req.files.photo.name;
                 } else {
                     newFriend.photo = req.files.photo.name;
                 }
             }
        }
        newFriend.getScores();
        newFriend.getPhoto();
        //send newFriend to the api
        dataArr.push(newFriend);
        //if there's no photo file
        if (JSON.stringify(req.files) === "{}") {
            //end the post request with a valid res
                res.send(true);
        } 
        else {
            // The name of the input field 'photo' is used to retrieve the uploaded file 
            let photo = req.files.photo;
            //  Use the mv() method to place the file somewhere on the server 
                //original route; works on pc
                    // 'path.join(__dirname,'../public/images/' + photo.name
                // for heroku
                // path.join( __dirname,'/../../public/images/',photo.name

            console.log(__dirname);
            photo.mv(path.join( __dirname,'../public/images/',photo.name),function(err) {
                if (err) {
                return res.status(500).send(err);
                }
                //end the post with a valid res 
                res.send(true);
            });
        }
    });

    app.get("/api/:friends?", function(req, res) {
        
        var chosen = req.params.friends
        
        if (chosen) {
            for (var i=0; i < dataArr.length; i++) {
                if (chosen === dataArr[i].name) {
                    return res.json(dataArr[i]);
                }
            }  
            return res.json(false);
        }
       return res.json(dataArr);         
    });

    app.get("/survey2/:photo", function(req, res) {
       
        if (req.params.photo == "undefined") {
            return res.set("Connection", "close");
         
        } else {
            //original pathway, works on pc
                //path.join(__dirname, "../public/images"
            //heroku pathway
                //path.join( __dirname,'/../../public/images/',req.params.photo)
            res.sendFile(path.join( __dirname,'../public/images/',req.params.photo));
            return res.set("Connection", "close");
        }  
    });
 
}
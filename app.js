var express = require('express');
var app = express();
var request = require('request');
const mongoose = require('mongoose');
var bp = require('body-parser');

mongoose.connect('mongodb://localhost:27017/guitar_tabs', {useNewUrlParser: true, useUnifiedTopology: true});

const StarredSong = mongoose.model('StarredSong', {
    title: String,
    artist: String,
    songID: String,
    dateAdded: Date
});

app.set("view engine", "ejs")
app.use(express.static('public'));
app.use(bp.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/list', (req, res) => {
    StarredSong.find({}, (err, allSongs) => {
        if(err) {
            console.log(err);
        } else {
            res.render('list', {songs: allSongs});
        }
    });
})

app.get('/search', (req, res) => {
    if(req.query.userQuery){
        url = `http://www.songsterr.com/a/ra/songs/byartists.json?artists="${req.query.userQuery}"`
        request(url, (error, response, body) => {
            if(!error && response.statusCode == 200){
                parsedData = JSON.parse(body);
                res.render('result', {data: parsedData, userQuery: req.query.userQuery});
            }
        })
    } else {
        res.redirect('/');
    }
});

app.post('/search', (req, res) => {
    StarredSong.create({
        title: req.body.title,
        artist: req.body.artist,
        songID: req.body.songID,
        dateAdded: Date()
    }, (err, song) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/list");
        }
    });
});

app.listen(3000, () => {
    console.log('Server started...');
})
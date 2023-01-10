const express = require('express');
const app = express();
const port = 3000;
const expressSanitizer = require('express-sanitizer');

var genres = require('./genres.json');
var artists = require('./raw_artists.json');
var tracks = require('./raw_tracks.json');
var albums = require('./raw_albums.json');
var lists = require('./lists.json');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use('/', express.static('static'));
app.use(expressSanitizer());

var fs = require('fs');

var short_genres = (function(){
    arr = [];
    for (var i = 0; i<genres.length; i++){
        arr.push({genre_id: genres[i].genre_id, parent: genres[i].parent, title: genres[i].title})
    }
    return arr;
})();

var short_tracks = (function(){
    arr = [];
    for (var i = 0; i<tracks.length; i++){
        arr.push({track_id: tracks[i].track_id, album_id:tracks[i].album_id, album_title:tracks[i].album_title, artist_id:tracks[i].artist_id, artist_name:tracks[i].artist_name, tags:tracks[i].tags, track_date_created:tracks[i].track_date_created, track_date_recorded:tracks[i].track_date_recorded, track_duration:tracks[i].track_duration, track_genres:tracks[i].track_genres, track_number:tracks[i].track_number, track_title:tracks[i].track_title});
    }
    return arr;
})();

//Requirement 1
app.get('/api/genres', (req, res) => {
    if(short_genres){
        res.send(short_genres);
    } else {
        res.status(404).send('Genres not found')
    }
});

//Requirement 2
app.get('/api/artists-by-id/:artist_id', (req, res) => {
    const id = req.sanitize(req.params.artist_id);
    if(!isValidNumber(id)){
        res.status(400).send('Invalid request');
    }
    let artist = artists.find(a => a.artist_id === parseInt(id));
    if(artist){
        res.send(artist);
    } else {
        res.status(404).send(`Artist with ID ${id} was not found`);
    }
});

//Requirement 3
app.get('/api/tracks/:track_id', (req, res) => {
    const id = req.sanitize(req.params.track_id);
    if(!isValidNumber(id)){
        res.status(400).send('Invalid request');
    }
    let track = short_tracks.find(t => t.track_id === parseInt(id));
    if(track){
        res.send(track);
    } else {
        res.status(404).send(`Track with ID ${id} was not found`);
    }
});

//Requirement 4
app.get('/api/album-track-by-name/:search', (req, res) => {
    const key = req.sanitize(req.params.search);
    if(!isValidString(key)){
        res.status(400).send('Invalid request');
    }
    let matches = [];
    for(var i=0;tracks.length;i++){
        let currentTrack = tracks[i];
        if(String(currentTrack.track_title).includes(key) || String(currentTrack.album_title).includes(key)){
            matches.push({track_id:currentTrack.track_id});
        }
        if(matches.length == 20){
            break;
        }
    }
    if(matches.length == 0){
        res.status(404).send(`No tracks with ${key} in their title or album title were found`)
    } else{
        res.send(matches);
    }
});

//Requirement 5
app.get('/api/artists-by-name/:artist_name', (req, res) => {
    const key = req.sanitize(req.params.artist_name);
    if(!isValidString(key)){
        res.status(400).send('Invalid request');
    }
    let matches = [];
    for(var i=0;i<artists.length;i++){
        let currentArtist = artists[i];
        if(String(currentArtist.artist_name).toLowerCase().includes(key)){
            matches.push({artist_id:currentArtist.artist_id});
        }
    }
    if(matches.length == 0){
        res.status(404).send(`No artists with ${key} in their name were found`)
    } else{
        res.send(matches);
    }
});

//Requirement 6
app.put('/api/lists/:name', (req, res) => {
    const newList = req.body;
    newList.name = req.sanitize(req.params.name);
    let listNameExists = false;
    if(!isValidString(req.params.name)){
        res.status(400).send('Invalid request');
    }

    for(var i=0;i<lists.length;i++){
        currentList = lists[i];
        if(currentList.name == newList.name){
            listNameExists = true;           
            break;
        }
    }

    if(!listNameExists){
        let data = JSON.parse(fs.readFileSync('lists.json'));
        data.push(newList);
        fs.writeFileSync('lists.json', JSON.stringify(data));
        res.send(newList);
    } else {
        res.status(400).send(`Playlist with name ${req.params.name} already exists`)
    }
});

//Requirement 7
app.post('/api/lists/:name', (req, res) => {
    const listUpdate = req.body;
    let data = JSON.parse(fs.readFileSync('lists.json'));
    let listNameExists = false;

    if(!isValidString(req.params.name)){
        res.status(400).send('Invalid request');
    }

    for(var i=0;i<data.length;i++){
        currentList = data[i];
        if(currentList.name == req.sanitize(req.params.name)){
            currentList.track_IDs = listUpdate;
            listNameExists = true;           
        }
    }

    if(!listNameExists){
        res.status(400).send(`Playlist with name ${req.params.name} does not exist`);
    } else {
        fs.writeFileSync('lists.json', JSON.stringify(data));
        res.send(listUpdate);
    }
})

//Requirement 8
app.get('/api/lists/:name', (req, res) => {
    const key = req.sanitize(req.params.name);
    if(!isValidString(key)){
        res.status(400).send('Invalid request');
    }
    for(var i=0;i<lists.length;i++){
        currentList = lists[i];
        if(currentList.name == key){
            res.send(currentList.track_IDs);
            return;
        }
    }
    res.status(404).send(`Playlist with name ${key} does not exist`);
})

//Requirement 9
app.delete('/api/lists/:name', (req, res) => {
    const key = req.sanitize(req.params.name);
    if(!isValidString(key)){
        res.status(400).send('Invalid request');
    }
    let data = JSON.parse(fs.readFileSync('lists.json'));
    for(var i=0;i<data.length;i++){
        currentList = data[i];
        if(currentList.name == key){
            data.splice(i, 1);
            res.send(currentList);
            fs.writeFileSync('lists.json', JSON.stringify(data));
            return;
        } 
    }
    res.status(404).send(`Playlist with name ${key} does not exist`);
})

//Requirement 10
app.get('/api/lists', (req, res) => {
    if(lists){
        let output = [];
        for(i=0;i<lists.length;i++){
            currentList = lists[i];
            pt = 0;
            listTracks = currentList.track_IDs;
            for(j=0;j<listTracks.length;j++){
                for(k=0;k<tracks.length;k++){
                    if(listTracks[j] == tracks[k].track_id){
                        pt += timeToSecs(tracks[k].track_duration);
                    }
                }
            }
            console.log(pt);
            output.push({name:currentList.name,length:currentList.track_IDs.length,playtime:timeToMins(pt)});
        }
        res.send(output);
    } else {
        res.status(404).send(`You do not have any playlists`);
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function timeToSecs(time){
    var t = time.split(':');
    return parseInt(t[0])*60 + parseInt(t[1]);
}

function timeToMins(secs){
    var m = String(secs/60);
    var s = String(secs%60).padStart(2,0);
    return Math.floor(m) + ':' + s;
}

function isValidString(s){
    return /^[a-z0-9]+$/.test(s);
}

function isValidNumber(n){
    return /^\d+$/.test(n);
}
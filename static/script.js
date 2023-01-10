const artistSearchBox = document.getElementById('artist-search-box');
const albumTrackSearchBox = document.getElementById('album-track-search-box');
const artistSearchButton = document.getElementById('artist-search-button');
const albumTrackSearchButton = document.getElementById('album-track-search-button');
const playlistName = document.getElementById('create-playlist-name');
const playlistTracks = document.getElementById('create-playlist-tracks');
const createPlaylistButton = document.getElementById('create-playlist-button');
const updatePlaylistButton = document.getElementById('update-playlist-button');
const viewPlaylistButton = document.getElementById('view-playlist-button');
const viewAllPlaylistsButton = document.getElementById('view-all-playlist-button');
const deletePlaylistButton = document.getElementById('delete-playlist-button');
const allGenresButton = document.getElementById('all-genres-button');

artistSearchButton.addEventListener('click',searchArtist);
albumTrackSearchButton.addEventListener('click',searchTracks);
createPlaylistButton.addEventListener('click',createPlaylist);
updatePlaylistButton.addEventListener('click',updatePlaylist);
viewPlaylistButton.addEventListener('click',viewPlaylist)
viewAllPlaylistsButton.addEventListener('click',viewAllPlaylists);
deletePlaylistButton.addEventListener('click',deletePlaylist);
allGenresButton.addEventListener('click', viewAllGenres);

//Requirement 1
async function searchArtist(event){
    event.preventDefault();
    let key = String(artistSearchBox.value);
    const l = document.getElementById('search-results');
    clearList(l);
    const response = await fetch(`/api/artists-by-name/${key}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if(response.status != 200){
            let message = await response.text();
            alert(message);
        }
    let array = await response.json();
    let array2 = [];
    for(i=0;i<array.length;i++){
        const r = await fetch(`/api/artists-by-id/${array[i].artist_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        let tempArray = await r.json();
        array2.push(tempArray);
    }
    for(i=0;i<array2.length;i++){
        const result = document.createElement('li');
            result.appendChild(document.createTextNode(array2[i].artist_name));
            l.appendChild(result);
    }
}

async function searchTracks(event){
    event.preventDefault();
    let key = String(albumTrackSearchBox.value);
    const l = document.getElementById('search-results');
    clearList(l);
    const response = await fetch(`api/album-track-by-name/${key}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if(response.status != 200){
        let message = await response.text();
        alert(message);
    }
    let array = await response.json();
    let array2 = [];
    for(i=0;i<array.length;i++){
        const r = await fetch(`/api/tracks/${array[i].track_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        let tempArray = await r.json();
        array2.push(tempArray);
    }
    for(i=0;i<array2.length;i++){
        const result = document.createElement('li');
        result.appendChild(document.createTextNode(array2[i].track_title));
        l.appendChild(result);
    }
}

function clearList(list){
    while(list.firstChild){
        list.removeChild(list.firstChild);
    }
}

//Requirement 2
async function viewPlaylist(event){

    event.preventDefault();
    
    const name = playlistName.value;
    const response = await fetch(`api/lists/${name}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if(response.status != 200){
        let message = await response.text();
        alert(message);
    }
    const tracks = await response.json();
    displayPlaylist(name,tracks);
}

async function createPlaylist(){
    const newPlaylist = {
        track_IDs:playlistTracks.value.split(',')
    }
    const response = await fetch(`/api/lists/${playlistName.value}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newPlaylist)
    })
    if(response.status != 200){
        let message = await response.text();
        alert(message);
        return;
    }
    alert('Success');
}

async function updatePlaylist(){
    const playlistUpdate = {
        track_IDs:playlistTracks.value.split(',')
    }
    const response = await fetch(`/api/lists/${playlistName.value}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(playlistUpdate)
    })
    if(response.status != 200){
        let message = await response.text();
        alert(message);
        return;
    }
    alert('Success');
}

async function displayPlaylist(name,tracks){
    const n = document.getElementById('playlist-name');
    const l = document.getElementById('track-display');
    clearList(n);
    clearList(l);
    n.appendChild(document.createTextNode(name));
    for(i=0;i<tracks.length;i++){
        const r = await fetch(`/api/tracks/${tracks[i]}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const trackData = await r.json();
        const result = document.createElement('li');
        result.appendChild(document.createTextNode("Track ID: " + tracks[i]));

        let trackInfo = document.createElement('ul');

        let artist = document.createElement('li')
        artist.appendChild(document.createTextNode("Artist name: " + trackData.artist_name));
        let title = document.createElement('li')
        title.appendChild(document.createTextNode("Track title: " + trackData.track_title));
        let album = document.createElement('li')
        album.appendChild(document.createTextNode("Album title: " + trackData.album_title));
        let playTime = document.createElement('li')
        playTime.appendChild(document.createTextNode("Duration: " + trackData.track_duration));

        trackInfo.appendChild(artist);
        trackInfo.appendChild(title);
        trackInfo.appendChild(album);
        trackInfo.appendChild(playTime);

        result.appendChild(trackInfo);
        l.appendChild(result);
    }
}

//Implementing remaining backend functions
async function viewAllPlaylists(event){
    event.preventDefault();
    const response = await fetch('/api/lists', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
    if(response.status != 200){
        let message = await response.text();
        alert(message);
        return;
    }
    const lists = await response.json();

    const n = document.getElementById('playlist-name');
    const l = document.getElementById('track-display');
    clearList(n);
    clearList(l);
    n.appendChild(document.createTextNode('Playlists'));
    for(i=0;lists.length;i++){
        const result = document.createElement('li');
        result.appendChild(document.createTextNode("Playlist name: " + lists[i].name));

        let playlistInfo = document.createElement('ul');

        let length = document.createElement('li')
        length.appendChild(document.createTextNode("Length: " + lists[i].length));
        let playtime = document.createElement('li')
        playtime.appendChild(document.createTextNode("Playtime: " + lists[i].playtime));

        playlistInfo.appendChild(length);
        playlistInfo.appendChild(playtime);

        result.appendChild(playlistInfo);
        l.appendChild(result);
    }
}

async function deletePlaylist(){
    const response = await fetch(`/api/lists/${playlistName.value}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })
    if(response.status != 200){
        let message = await response.text();
        alert(message);
        return;
    }
    alert('Success');
}

async function viewAllGenres(){
    const l = document.getElementById('search-results');
    clearList(l);

    const response = await fetch('api/genres', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
    })
    if(response.status != 200){
        let message = await response.text();
        alert(message);
        return;
    }
    const genres = await response.json();
    
    for(i=0;i<genres.length;i++){
        const result = document.createElement('li');
        result.appendChild(document.createTextNode('Genre: ' + genres[i].title + " ID: " + genres[i].genre_id + " Parent: " + genres[i].parent));
        l.appendChild(result);
    }
}
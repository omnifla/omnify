let albums = [];
let singles = [];

// Global variables
let currentAlbum = null;
let currentSingleIndex = -1; // Index for the currently playing single
let currentSongIndex = 0; // Index of the current song
let songs = []; // Store all songs dynamically
let isPlaying = false;
let isLooping = false;
const audioElement = new Audio(); // Audio object


async function getAudioDuration(filePath) {
    return new Promise((resolve) => {
        const audio = new Audio(filePath);
        audio.addEventListener('loadedmetadata', () => {
            const duration = formatTime(audio.duration);
            resolve(duration);
        });
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); // Hide all pages
    document.getElementById(page).classList.add('active'); // Show the selected page
}


async function fetchJsonFiles(type) {
    console.log(`Fetching ${type} files`);
    const response = await fetch(`server.php?type=${type}`);
    const files = await response.json();
    console.log(`${type} files:`, files); // Log the list of files
    return files;
}

async function fetchMetadataFile(type, file) {
    console.log(`Fetching metadata for ${type}/${file}`);
    const response = await fetch(`server.php?type=${type}&file=${file}`);
    const data = await response.json();
    console.log(`Metadata for ${file}:`, data); // Log the metadata
    return data;
}


async function loadMetadata() {
    // Fetch album metadata
    const albumFiles = await fetchJsonFiles('albums');
    for (const file of albumFiles) {
        const albumData = await fetchMetadataFile('albums', file);
        for (let song of albumData.songs) {
            song.length = await getAudioDuration(song.file); // Get song duration dynamically
        }
        albums.push(albumData); // Add to global albums array
    }

    // Fetch single metadata
    const singleFiles = await fetchJsonFiles('singles');
    for (const file of singleFiles) {
        const singleData = await fetchMetadataFile('singles', file);
        singleData.song.length = await getAudioDuration(singleData.song.file); // Get single duration dynamically
        singles.push(singleData); // Add to global singles array
    }

    console.log('Albums loaded:', albums); // Debugging
    console.log('Singles loaded:', singles); // Debugging
}



function renderAlbums() {
    const albumContainer = document.getElementById('album-container');
    albums.forEach(album => {
        const albumElement = document.createElement('div');
        albumElement.className = 'album';
        albumElement.innerHTML = `
            <img src="${album.image}" alt="${album.title}">
            <div>
                <h3>${album.title}</h3>
                <p>${album.artist}</p>
                <button onclick="playAlbum('${album.title}')">Play Album</button>
                <ul>
                    ${album.songs.map(song => `<li>${song.title} (${song.length})</li>`).join('')}
                </ul>
            </div>
        `;
        albumContainer.appendChild(albumElement);
    });
}

function renderSingles() {
    const singleContainer = document.getElementById('single-container');
    singles.forEach(single => {
        const singleElement = document.createElement('div');
        singleElement.className = 'single';
        singleElement.innerHTML = `
            <img src="${single.image}" alt="${single.title}">
            <div>
                <h3>${single.title}</h3>
                <p>${single.artist}</p>
                <button onclick="playSingle('${single.title}')">Play Single</button>
                <p>${single.song.title} (${single.song.length})</p>
            </div>
        `;
        singleContainer.appendChild(singleElement);
    });
}

function updateCurrentSongInfo(song) {
    const currentSongImage = document.getElementById('current-song-image');
    const currentSongInfo = document.getElementById('current-song-info');

    // Update image and text
    currentSongImage.src = song.image || ''; // Fallback to an empty string if no image is provided
    currentSongInfo.textContent = `${song.title} by ${song.artist}`;
}



function playAlbum(albumTitle) {
    currentAlbum = albums.find(album => album.title === albumTitle);
    if (!currentAlbum) {
        console.error('Album not found:', albumTitle);
        return;
    }

    currentSongIndex = 0;
    playSongFromAlbum();
}


function playSongFromAlbum() {
    if (!currentAlbum || currentSongIndex >= currentAlbum.songs.length) {
        console.log('Album finished');
        return;
    }

    const song = currentAlbum.songs[currentSongIndex];
    audioElement.src = song.file;
    audioElement.play();

    isPlaying = true;

    // Update current song display
    updateCurrentSongInfo({
        title: song.title,
        artist: currentAlbum.artist,
        image: currentAlbum.image,
    });

    // Play the next song when the current one ends
    audioElement.onended = () => {
        currentSongIndex++;
        playSongFromAlbum();
    };

    console.log(`Playing song from album: ${song.title}`);
}


function playSingle(singleTitle) {
    const single = singles.find(s => s.title === singleTitle);
    if (!single) {
        console.error('Single not found:', singleTitle);
        return;
    }

    const song = single.song;
    audioElement.src = song.file;
    audioElement.play();

    isPlaying = true;

    // Update current song display
    updateCurrentSongInfo({
        title: song.title,
        artist: single.artist,
        image: single.image,
    });

    console.log(`Playing single: ${song.title}`);
}

function stopPlayback() {
    audioElement.pause();
    isPlaying = false;

    // Reset current song display
    const currentSongImage = document.getElementById('current-song-image');
    const currentSongInfo = document.getElementById('current-song-info');

    currentSongImage.src = '';
    currentSongInfo.textContent = 'No song playing';
}


// Toggle play/pause
window.togglePlayPause = function () {
    if (isPlaying) {
        audioElement.pause();
    } else {
        audioElement.play();
    }
    isPlaying = !isPlaying;
    console.log('Playing:', isPlaying);
};

// Go to the next song
window.nextSong = function () {
    if (currentAlbum) {
        // Handle album playback
        currentSongIndex = (currentSongIndex + 1) % currentAlbum.songs.length;
        playSongFromAlbum();
    } else if (currentSingleIndex >= 0) {
        // Handle single playback
        currentSingleIndex = (currentSingleIndex + 1) % singles.length;
        playSingle(singles[currentSingleIndex].title);
    } else {
        console.error('No songs loaded');
    }
};

// Go to the previous song
window.prevSong = function () {
    if (currentAlbum) {
        // Handle album playback
        currentSongIndex = (currentSongIndex - 1 + currentAlbum.songs.length) % currentAlbum.songs.length;
        playSongFromAlbum();
    } else if (currentSingleIndex >= 0) {
        // Handle single playback
        currentSingleIndex = (currentSingleIndex - 1 + singles.length) % singles.length;
        playSingle(singles[currentSingleIndex].title);
    } else {
        console.error('No songs loaded');
    }
};


// Toggle loop
window.toggleLoop = function () {
    isLooping = !isLooping;
    audioElement.loop = isLooping;
    console.log('Looping:', isLooping);
};

// Adjust volume
window.adjustVolume = function (volume) {
    audioElement.volume = volume;
    console.log('Volume:', volume);
};


window.performSearch = function (event) {
    event.preventDefault(); // Prevent form submission

    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    if (filteredSongs.length > 0) {
        filteredSongs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = 'search-result';
            songElement.innerHTML = `
                <img src="${song.image}" alt="${song.title}" width="50" height="50">
                <div>
                    <div>${song.title} - ${song.artist}</div>
                    <button onclick="playSingle('${song.title}')">Play</button>
                </div>
            `;
            resultsContainer.appendChild(songElement);
        });
    } else {
        resultsContainer.textContent = 'No results found';
    }
};


// Make `showPage` available globally
window.showPage = showPage;

window.onload = async function () {
    showPage('home'); // Ensure the Home page is active by default
    await loadMetadata(); // Load metadata dynamically
    console.log('Metadata loaded. Ready to play songs.');    
    renderAlbums(); // Render albums
    renderSingles(); // Render singles
};

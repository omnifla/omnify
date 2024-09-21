document.addEventListener('DOMContentLoaded', () => {
    const songs = [
        { title: 'Not Like Us', artist: 'Kendrick Lamar', url: 'songs/notlikeus.mp3', image: 'images/NotLikeUs.png' },
        { title: 'Drive Thru of BK', artist: 'CaseOh', url: 'songs/SongTooBig.mp3', image: 'images/caseohbk.png'  },
        { title: 'Carnival ft. Rich The Kid, and Playboi Carti', artist: '¥$, Kanye West, Ty Dolla $ign', url: 'songs/Carnival.mp3', image: 'images/Carnival.png' },
        { title: 'Runaway ft. Pusha T', artist: 'Kanye West', url: 'songs/Runaway.mp3', image: 'images/Runaway.png' },
        { title: 'Good Morning', artist: 'KanYe West', url: 'songs/GoodMorning.mp3', image: 'images/GoodMorning.png' },
        { title: 'Watch the Party Die', artist: 'Kendrick Lamar', url: 'songs/WatchThePartyDie.mp3', image: 'images/WatchThePartyDie.png' }

    ];

    const audioElement = new Audio();
    let currentSongIndex = 0;
    let isPlaying = false;
    let isLooping = false;

    function loadSongs() {
        const playlistContainer = document.querySelector('.playlists');
        songs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.className = 'playlist';
            songElement.innerHTML = `
                <div>${song.title} - ${song.artist}</div>
                <button onclick="playSong(${index})">Play</button>
                <span id="song-length-${index}"></span>
            `;
            playlistContainer.appendChild(songElement);

            // Load the song to get its duration
            const tempAudio = new Audio(song.url);
            tempAudio.addEventListener('loadedmetadata', () => {
                document.getElementById(`song-length-${index}`).textContent = formatTime(tempAudio.duration);
            });
        });
    }

    function playSong(index) {
        currentSongIndex = index;
        audioElement.src = songs[index].url;
        audioElement.play();
        isPlaying = true;
        updatePlayerControls();
        const currentSongImage = document.getElementById('current-song-image');
        const currentSongInfo = document.getElementById('current-song-info');
        currentSongImage.src = songs[index].image;
        currentSongInfo.textContent = `Playing: ${songs[index].title} by ${songs[index].artist}`;
    }

    function togglePlayPause() {
        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play();
        }
        isPlaying = !isPlaying;
        updatePlayerControls();
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    }

    function toggleLoop() {
        isLooping = !isLooping;
        audioElement.loop = isLooping;
        updateLoopButton();
    }

    function updatePlayerControls() {
        const playPauseButton = document.querySelector('.player-controls button:nth-child(2)');
        playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
    }

    function updateLoopButton() {
        const loopButton = document.querySelector('.player-controls button:nth-child(4)');
        loopButton.textContent = isLooping ? 'Looping' : 'Loop';
    }

    function adjustVolume(volume) {
        audioElement.volume = volume;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(page).classList.add('active');
    }

    function performSearch(event) {
        event.preventDefault();
        const query = document.getElementById('search-input').value.toLowerCase();
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';

        const filteredSongs = songs.filter(song => 
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query)
        );

        if (filteredSongs.length > 0) {
            filteredSongs.forEach((song, index) => {
                const songElement = document.createElement('div');
                songElement.className = 'search-result';
                songElement.innerHTML = `
                    <img src="${song.image}" alt="${song.title}" width="50" height="50">
                    <div>
                        <div>${song.title} - ${song.artist}</div>
                        <button onclick="playSong(${songs.indexOf(song)})">Play</button>
                    </div>
                `;
                resultsContainer.appendChild(songElement);
            });
        } else {
            resultsContainer.textContent = 'No results found';
        }
    }

    window.playSong = playSong;
    window.togglePlayPause = togglePlayPause;
    window.prevSong = prevSong;
    window.nextSong = nextSong;
    window.adjustVolume = adjustVolume;
    window.toggleLoop = toggleLoop;
    window.performSearch = performSearch;
    window.showPage = showPage;

    loadSongs();
    showPage('home');
});
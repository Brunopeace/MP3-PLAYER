if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

const audio = document.getElementById('audio');
const playButton = document.getElementById('play');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const volumeSlider = document.getElementById('volume');
const progressBar = document.getElementById('progress');
const cover = document.getElementById('cover');
const songTitle = document.getElementById('song-title');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const visualizer = document.getElementById('visualizer');
const canvasCtx = visualizer.getContext('2d');

const songs = [
    { title: 'Adventure Of A Lifetime', src: 'music/Adventure Of A Lifetime.mp3', cover: 'music/capa/Adventure Of A Lifetime.jpeg' },
    { title: 'Goteiras', src: 'music/gregodopiseiro.mp3', cover: 'music/capa/grego-piseiro.jpeg' },
    { title: 'Guns N Roses', src: 'music/Guns N Roses Greatest Hits.mp3', cover: 'music/capa/Guns N Roses.jpg' },
    { title: 'Pharrell Williams', src: 'music/Pharrell Williams - Happy.mp3', cover: 'music/capa/Pharrell Williams.jpeg' },
    { title: 'Sky Full of Stars', src: 'music/Sky Full of Stars.mp3', cover: 'music/capa/Sky Full of Stars.jpeg' },
    { title: 'Tones and I', src: 'music/DANCE MONKEY.mp3', cover: 'music/capa/DANCE MONKEY.jpeg' },
    { title: 'Deixa', src: 'music/igreja/Maria Marçal Deixa.mp3', cover: 'music/capa/deixa.jpeg' },
    { title: 'deserto', src: 'music/igreja/Maria Marçal Deserto.mp3', cover: 'music/capa/deserto.jpeg' },
    { title: 'Existe Vida Aí', src: 'music/igreja/Nathália Braga Existe Vida Aí.mp3', cover: 'music/capa/Existe Vida Aí.jpeg' },
    { title: 'Song 10', src: 'song3.mp3', cover: 'cover3.jpg' },
    { title: 'Song 11', src: 'song2.mp3', cover: 'cover2.jpg' },
    { title: 'Song 12', src: 'song3.mp3', cover: 'cover3.jpg' }
];

let currentSongIndex = parseInt(localStorage.getItem('currentSongIndex')) || 0;
let lastVolume = localStorage.getItem('volume') || 1;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);

    const barWidth = (visualizer.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        const red = 50 + (barHeight * 2);
        const green = 250 - (barHeight * 2);
        const blue = 150;

        canvasCtx.fillStyle = `rgb(${red},${green},${blue})`;
        canvasCtx.fillRect(x, visualizer.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}

draw();

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Atualiza o relógio a cada segundo
setInterval(updateClock, 1000);

// Atualiza o relógio imediatamente ao carregar a página
updateClock();

function loadSong(song) {
    audio.src = song.src;
    cover.src = song.cover;
    songTitle.textContent = song.title;
    audio.onloadedmetadata = () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    };
    audio.onerror = () => {
        alert('Musica não encontrada.');
    };
}

function playSong() {
    audio.play();
    playButton.textContent = 'Pause';
    cover.classList.add('glow-animation');
    playButton.classList.add('pulse-animation');
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function pauseSong() {
    audio.pause();
    playButton.textContent = 'Play';
    cover.classList.remove('glow-animation');
    playButton.classList.remove('pulse-animation');
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(songs[currentSongIndex]);
    playSong();
    saveState();
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(songs[currentSongIndex]);
    playSong();
    saveState();
}

function updateProgress() {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

function setProgress() {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function saveState() {
    localStorage.setItem('currentSongIndex', currentSongIndex);
}

playButton.addEventListener('click', () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

prevButton.addEventListener('click', prevSong);
nextButton.addEventListener('click', nextSong);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextSong); // Certifique-se de que o evento 'ended' chama a função nextSong
progressBar.addEventListener('input', setProgress);

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    localStorage.setItem('volume', e.target.value);
});
audio.volume = lastVolume;
loadSong(songs[currentSongIndex]);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        navigator.serviceWorker.ready.then(registration => {
            return registration.sync.register('sync-music');
        });
    }
});
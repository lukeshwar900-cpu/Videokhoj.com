// अपनी API Key यहाँ डालें (जो आपने बनाई है)
const API_KEY = 'AIzaSyA5QG5m4SOxSOB_7hX3Bx2LKk1u9SH8r7Q';

const searchButton = document.getElementById('searchButton');
const shortsButton = document.getElementById('shortsButton');
const loadMoreButton = document.getElementById('loadMoreButton');
const searchInput = document.getElementById('searchInput');
const videoContainer = document.getElementById('video-container');
const playerContainer = document.getElementById('player-container');
const videoPlayer = document.getElementById('video-player');
const loadMoreContainer = document.getElementById('load-more-container');

let nextPageToken = '';
let currentSearchType = ''; // 'trending', 'search', or 'shorts'

searchButton.addEventListener('click', () => searchVideos(searchInput.value));
shortsButton.addEventListener('click', searchShorts);
loadMoreButton.addEventListener('click', loadMoreVideos);

document.addEventListener('DOMContentLoaded', getTrendingVideos);

async function getTrendingVideos() {
    currentSearchType = 'trending';
    nextPageToken = '';
    
    playerContainer.style.display = 'none';
    videoContainer.style.display = 'flex';
    
    videoContainer.innerHTML = '<h2>ट्रेंडिंग वीडियो लोड हो रहे हैं...</h2>';
    loadMoreContainer.style.display = 'none';

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&maxResults=50&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        displayVideos(data.items, true);
        if (data.nextPageToken) {
            nextPageToken = data.nextPageToken;
            loadMoreContainer.style.display = 'block';
        }

    } catch (error) {
        console.error('Error fetching trending videos:', error);
        videoContainer.innerHTML = '<p>ट्रेंडिंग वीडियो नहीं मिल सके।</p>';
    }
}

async function searchVideos(query, isNewSearch = true) {
    currentSearchType = 'search';
    if(isNewSearch) {
        nextPageToken = '';
        playerContainer.style.display = 'none';
        videoContainer.style.display = 'flex';
        videoContainer.innerHTML = '<h2>खोज रहे हैं...</h2>';
        loadMoreContainer.style.display = 'none';
    }
    
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&type=video&part=snippet&q=${query}&maxResults=50&pageToken=${nextPageToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        displayVideos(data.items, isNewSearch);
        
        if (data.nextPageToken) {
            nextPageToken = data.nextPageToken;
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }

    } catch (error) {
        console.error('Error fetching search results:', error);
        videoContainer.innerHTML = '<p>कुछ गलत हो गया।</p>';
    }
}

async function searchShorts() {
    currentSearchType = 'shorts';
    nextPageToken = '';
    
    playerContainer.style.display = 'none';
    videoContainer.style.display = 'flex';
    
    videoContainer.innerHTML = '<h2>शॉर्ट्स खोज रहे हैं...</h2>';
    loadMoreContainer.style.display = 'none';

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&type=video&part=snippet&q=shorts&videoDuration=short&maxResults=50&order=viewCount&pageToken=${nextPageToken}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        displayVideos(data.items, true);
        
        if (data.nextPageToken) {
            nextPageToken = data.nextPageToken;
            loadMoreContainer.style.display = 'block';
        }

    } catch (error) {
        console.error('Error fetching shorts:', error);
        videoContainer.innerHTML = '<p>शॉर्ट्स नहीं मिल सके।</p>';
    }
}

async function loadMoreVideos() {
    if (!nextPageToken) return;

    if (currentSearchType === 'trending') {
        // ट्रेंडिंग वीडियो के लिए पेजिनेशन
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&maxResults=50&key=${API_KEY}&pageToken=${nextPageToken}`;
        const response = await fetch(url);
        const data = await response.json();
        displayVideos(data.items, false);
        nextPageToken = data.nextPageToken || '';
        if (!nextPageToken) loadMoreContainer.style.display = 'none';

    } else if (currentSearchType === 'search') {
        // सर्च रिजल्ट्स के लिए पेजिनेशन
        searchVideos(searchInput.value, false);
        
    } else if (currentSearchType === 'shorts') {
        // शॉर्ट्स के लिए पेजिनेशन
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&type=video&part=snippet&q=shorts&videoDuration=short&maxResults=50&order=viewCount&pageToken=${nextPageToken}`;
        const response = await fetch(url);
        const data = await response.json();
        displayVideos(data.items, false);
        nextPageToken = data.nextPageToken || '';
        if (!nextPageToken) loadMoreContainer.style.display = 'none';
    }
}

function displayVideos(videos, isNewSearch) {
    if(isNewSearch) {
        videoContainer.innerHTML = '';
    }
    
    if (videos.length === 0 && isNewSearch) {
        videoContainer.innerHTML = '<p>कोई वीडियो नहीं मिला।</p>';
        return;
    }

    videos.forEach(video => {
        const videoId = video.id.videoId || (video.id.kind === 'youtube#video' ? video.id.videoId : video.id);
        const title = video.snippet.title;
        const description = video.snippet.description;
        const thumbnailUrl = video.snippet.thumbnails.high.url;
        
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';

        videoCard.onclick = () => {
            playVideo(videoId);
        };

        videoCard.innerHTML = `
            <img src="${thumbnailUrl}" alt="${title}">
            <div class="video-info">
                <h3>${title}</h3>
                <p>${description.substring(0, 50)}...</p>
            </div>
        `;
        videoContainer.appendChild(videoCard);
    });
}

function playVideo(videoId) {
    videoContainer.style.display = 'none';
    playerContainer.style.display = 'block';
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
}

function closePlayer() {
    playerContainer.style.display = 'none';
    videoPlayer.src = '';
    
    if (currentSearchType === 'trending') {
        videoContainer.style.display = 'flex';
        // ट्रेंडिंग वीडियो वापस दिखाने के लिए कुछ नहीं करना, क्योंकि वे पहले से ही हैं
    } else if (currentSearchType === 'search') {
        videoContainer.style.display = 'flex';
        // सर्च रिजल्ट्स वापस दिखाने के लिए कुछ नहीं करना, क्योंकि वे पहले से ही हैं
    } else if (currentSearchType === 'shorts') {
        videoContainer.style.display = 'flex';
    }
}

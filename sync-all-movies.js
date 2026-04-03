// sync-all-movies.js

const axios = require('axios');

// Replace 'YOUR_BEARER_TOKEN' with your actual TMDB API Bearer Token
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MjhkYzU3NDU5NjZhYjI2OGJmMDJmNWFmZjlhYWFiYiIsIm5iZiI6MTczNTk5MjkwMi42NzkwMDAxLCJzdWIiOiI2Nzc5MjY0NjZkN2NhMDBlNzg3MjdmMGIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Huzv7cIZRRKKLNSvbRZDQZmX9w0Ny1Gif6G8LI2WW30';
const BASE_URL = 'https://api.themoviedb.org/3';

const syncAllMovies = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/movie/popular`, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`
            }
        });
        console.log('Movies synced:', response.data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

syncAllMovies();

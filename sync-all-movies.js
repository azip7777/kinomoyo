// sync-all-movies.js

const axios = require('axios');

// Replace 'YOUR_BEARER_TOKEN' with your actual TMDB API Bearer Token
const API_TOKEN = 'YOUR_BEARER_TOKEN';
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

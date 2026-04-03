'use strict';
const axios = require('axios');
const fs = require('fs');

const apiKey = '0153d0396a14171e8af530a9a95d09fe';
const bearerToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTUzZDAzOTZhMTQxNzFlOGFmNTMwYTlhOTVkMDlmZSIsIm5iZiI6MTczNTk5MjkwMi42NzkwMDAxLCJzdWIiOiI2Nzc5MjI0NjZkN2NhMDBlNzg3MjdmMGIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.sk8xtBWz9lz0P8mUHsY8pvoj5mtoyTZBiAFG5fSH2yc';

async function fetchRatedMovies() {
    let page = 1;
    let movies = [];
    let totalPages;

    do {
        const response = await axios.get(`https://api.themoviedb.org/3/account/21728623/rated/movies`, {
            params: {
                api_key: apiKey,
                session_id: 'YOUR_SESSION_ID', // Replace with actual session ID if required
                page: page
            },
            headers: {
                Authorization: `Bearer ${bearerToken}`
            }
        });

        totalPages = response.data.total_pages;
        movies = movies.concat(response.data.results);
        page++;
    } while (page <= totalPages);

    return movies;
}

async function fetchDirector(movieId) {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
        params: {
            api_key: apiKey
        }
    });

    const director = response.data.crew.find(person => person.job === 'Director');
    return director ? director.name : 'Unknown';
}

async function generateConfig() {
    const movies = await fetchRatedMovies();
    const configData = [];

    for (const movie of movies) {
        const director = await fetchDirector(movie.id);
        configData.push({
            poster: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
            director: director,
            rating: movie.rating
        });
    }

    fs.writeFileSync('config.js', `module.exports = ${JSON.stringify(configData, null, 4)};`);
}

generateConfig()
    .then(() => console.log('config.js generated successfully'))
    .catch(err => console.error(err));

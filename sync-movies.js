const fetch = require('node-fetch');
const fs = require('fs');

const accessToken = 'YOUR_ACCESS_TOKEN'; // Replace with your TMDB access token
const apiUrl = 'https://api.themoviedb.org/3/movie/popular';
const configFilePath = 'config.js';

async function fetchRatedMovies() {
    let allMovies = [];
    let page = 1;
    let totalPages;

    do {
        const response = await fetch(`${apiUrl}?api_key=${accessToken}&page=${page}`);
        const data = await response.json();
        totalPages = data.total_pages;
        allMovies.push(...data.results);
        page++;
    } while (page <= totalPages);

    return allMovies;
}

function generateConfigFile(movies) {
    const configData = movies.map(movie => ({
        title: movie.title,
        rating: movie.vote_average,
        director: movie.director || 'Unknown'
    }));

    fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));
    console.log(`Config file generated with ${configData.length} movies.`);
}

fetchRatedMovies().then(movies => generateConfigFile(movies)).catch(error => console.error('Error fetching movies:', error));

const axios = require('axios');

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTUzZDAzOTZhMTQxNzFlOGFmNTMwYTlhOTVkMDlmZSIsIm5iZiI6MTczNTk5MjkwMi42NzkwMDAxLCJzdWIiOiI2Nzc5MjY0NjZkN2NhMDBlNzg3MjdmMGIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.sk8xtBWz9lz0P8mUHsY8pvoj5mtoyTZBiAFG5fSH2yc';
const API_KEY = '0153d0396a14171e8af530a9a95d09fe';

async function fetchRatedMovies() {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/account/21728623/rated/movies', {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: {
                'api_key': API_KEY,
                'language': 'en-US'
            }
        });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching rated movies:', error);
    }
}

async function fetchDirectorInfo(movies) {
    const directorPromises = movies.map(async (movie) => {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
        const director = response.data.credits.crew.find(member => member.job === 'Director');
        return {
            title: movie.title,
            director: director ? director.name : 'Unknown'
        };
    });
    return Promise.all(directorPromises);
}

async function main() {
    const ratedMovies = await fetchRatedMovies();
    const moviesWithDirectors = await fetchDirectorInfo(ratedMovies);
    const configData = moviesWithDirectors.map(movie => ({ title: movie.title, director: movie.director }));
    return configData;
}

main();

const fetch = require('node-fetch');
const tmdbApiKey = 'YOUR_TMDB_API_KEY'; // Replace with your TMDB API key
const sessionId = 'YOUR_SESSION_ID'; // Replace with your TMDB session ID
const ratedMoviesUrl = (page) => `https://api.themoviedb.org/3/account/21728623/rated/movies?api_key=${tmdbApiKey}&session_id=${sessionId}&page=${page}`;
const movieDetailsUrl = (movieId) => `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&append_to_response=credits`;

const fetchAllRatedMovies = async () => {
    let allMovies = [];
    let page = 1;
    
    while (true) {
        const response = await fetch(ratedMoviesUrl(page));
        const data = await response.json();
        
        if (!data.results.length) break; // Break if no more results
        
        const moviesWithDetails = await Promise.all(data.results.map(async (movie) => {
            const detailsResponse = await fetch(movieDetailsUrl(movie.id));
            const details = await detailsResponse.json();
            return {
                id: details.id,
                title: details.title,
                director: details.credits.crew.find(member => member.job === 'Director')?.name || 'Unknown',
                rating: movie.rating,
                overview: movie.overview,
            };
        }));

        allMovies = allMovies.concat(moviesWithDetails);
        page++;
    }

    return allMovies;
};

fetchAllRatedMovies().then(movies => {
    // Transform this into the desired config.js format
    const transformedMovies = movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        director: movie.director,
        rating: movie.rating,
        overview: movie.overview,
    }));

    console.log(transformedMovies); // For demo; you can save it to a file as needed
}).catch(err => {
    console.error('Error fetching movies:', err);
});

// sync-config.js

const API_KEY = 'YOUR_API_KEY_HERE';
const BEARER_TOKEN = 'YOUR_BEARER_TOKEN_HERE';
const ACCOUNT_ID = '21728623';
const PAGE_SIZE = 20;

const fetchRatedMovies = async (page) => {
    const response = await fetch(`https://api.themoviedb.org/3/account/${ACCOUNT_ID}/rated/movies?api_key=${API_KEY}&language=en-US&sort_by=created_at.asc&page=${page}`, {
        headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`
        }
    });

    if (!response.ok) {
        console.error(`Error fetching movies: ${response.statusText}`);
        throw new Error('Error fetching movies');
    }

    return await response.json();
};

const fetchDirectorAndPoster = async (movieId) => {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
    
    if (!response.ok) {
        console.error(`Error fetching movie details for ID ${movieId}: ${response.statusText}`);
        throw new Error('Error fetching movie details');
    }

    return await response.json();
};

const fetchAllMovies = async () => {
    let movies = [];
    let page = 1;
    let totalPages;

    do {
        const ratedMovies = await fetchRatedMovies(page);
        totalPages = ratedMovies.total_pages;

        const movieDetailsPromises = ratedMovies.results.map(movie => fetchDirectorAndPoster(movie.id));
        const movieDetails = await Promise.all(movieDetailsPromises);

        movies = [...movies, ...movieDetails.map(detail => ({
            title: detail.title,
            year: detail.release_date.split('-')[0],
            director: detail.credits.crew.find(crew => crew.job === 'Director')?.name || 'Unknown',
            rating: detail.vote_average,
            poster: `https://image.tmdb.org/t/p/w500${detail.poster_path}`
        }))];

        page++;
    } while (page <= totalPages);

    return movies;
};

fetchAllMovies()
    .then(moviesArray => {
        console.log('Fetched Movies:', moviesArray);
        export default moviesArray;
    })
    .catch(error => {
        console.error('Error in fetching movies data:', error);
    });

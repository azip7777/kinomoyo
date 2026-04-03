#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration from environment variables
const TMDB_API_KEY = process.env.TMDB_API_KEY || '0153d0396a14171e8af530a9a95d09fe';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTUzZDAzOTZhMTQxNzFlOGFmNTMwYTlhOTVkMDlmZSIsIm5iZiI6MTczNTk5MjkwMi42NzkwMDAxLCJzdWIiOiI2Nzc5MjY0NjZkN2NhMDBlNzg3MjdmMGIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.sk8xtBWz9lz0P8mUHsY8pvoj5mtoyTZBiAFG5fSH2yc';
const ACCOUNT_ID = process.env.ACCOUNT_ID || '21728623';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

let directorCache = {};

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error('Parse error:', e.message, 'Data:', data.substring(0, 200));
          reject(e);
        }
      });
    }).on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });
  });
}

async function getDirector(movieId) {
  if (directorCache[movieId]) {
    return directorCache[movieId];
  }

  try {
    const url = `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`;
    const data = await httpsGet(url);
    
    if (data.crew && Array.isArray(data.crew)) {
      const director = data.crew.find(d => d.job === 'Director');
      directorCache[movieId] = director ? director.name : 'Unknown';
    } else {
      directorCache[movieId] = 'Unknown';
    }
    
    return directorCache[movieId];
  } catch (error) {
    console.error(`Error fetching director for ${movieId}:`, error.message);
    directorCache[movieId] = 'Unknown';
    return 'Unknown';
  }
}

async function fetchAllRatedMovies() {
  let allMovies = [];
  let page = 1;
  let totalPages = 1;

  console.log('\n📽️  Fetching all rated movies from TMDB...\n');

  while (page <= totalPages) {
    try {
      const url = `${TMDB_BASE_URL}/account/${ACCOUNT_ID}/rated/movies?page=${page}`;
      const headers = {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`
      };
      
      const data = await httpsGet(url, headers);
      
      if (!data.results) {
        console.error('Error: No results in response');
        console.error('Response:', JSON.stringify(data).substring(0, 300));
        break;
      }
      
      allMovies = allMovies.concat(data.results);
      totalPages = data.total_pages || 1;
      
      const progress = ((page / totalPages) * 100).toFixed(1);
      console.log(`[${progress}%] Page ${page}/${totalPages}: ${data.results.length} movies | Total: ${allMovies.length}`);
      
      page++;
      await new Promise(r => setTimeout(r, 400)); // Rate limiting
    } catch (error) {
      console.error(`Error on page ${page}:`, error.message);
      page++;
    }
  }

  return allMovies;
}

async function transformMovie(movie) {
  const director = await getDirector(movie.id);
  
  return {
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster',
    title: movie.title || 'Unknown',
    year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : new Date().getFullYear(),
    director: director,
    rating: Math.round(movie.rating || 0)
  };
}

async function main() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   TMDB Movie Sync - KinoMoyo         ║');
  console.log('║   Account: 21728623                  ║');
  console.log('╚═══════════════════════════════════════╝');

  try {
    const movies = await fetchAllRatedMovies();
    console.log(`\n✅ Fetched ${movies.length} movies\n`);

    if (movies.length === 0) {
      console.error('❌ ERROR: No movies fetched!');
      process.exit(1);
    }

    console.log('🔄 Transforming movies...');
    const transformed = [];
    
    for (let i = 0; i < movies.length; i++) {
      try {
        const t = await transformMovie(movies[i]);
        transformed.push(t);
        
        if ((i + 1) % 300 === 0) {
          console.log(`   → Processed ${i + 1}/${movies.length}`);
        }
        
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        console.error(`Error transforming movie ${movies[i].id}:`, e.message);
      }
    }

    const content = `export const films = ${JSON.stringify(transformed, null, 2)};\n`;
    const filePath = path.join(__dirname, 'config.js');
    
    fs.writeFileSync(filePath, content);
    
    const sizeKB = (Buffer.byteLength(content) / 1024).toFixed(2);
    console.log(`\n✅ Generated config.js`);
    console.log(`   Size: ${sizeKB} KB`);
    console.log(`   Movies: ${transformed.length}`);
    console.log(`\n🎬 Sync complete!\n`);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

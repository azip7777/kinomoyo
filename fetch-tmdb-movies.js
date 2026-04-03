#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = '0153d0396a14171e8af530a9a95d09fe';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTUzZDAzOTZhMTQxNzFlOGFmNTMwYTlhOTVkMDlmZSIsIm5iZiI6MTczNTk5MjkwMi42NzkwMDAxLCJzdWIiOiI2Nzc5MjY0NjZkN2NhMDBlNzg3MjdmMGIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.sk8xtBWz9lz0P8mUHsY8pvoj5mtoyTZBiAFG5fSH2yc';
const ACCOUNT_ID = '21728623';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

let directorCache = {};

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      ...headers
    };

    https.get(url, { headers: defaultHeaders }, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`❌ HTTP ${res.statusCode}:`, data.substring(0, 200));
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getDirector(movieId) {
  if (directorCache[movieId]) {
    return directorCache[movieId];
  }

  try {
    const url = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;
    const data = await httpsGet(url, { 'Authorization': undefined });
    
    if (data.crew && Array.isArray(data.crew)) {
      const director = data.crew.find(d => d.job === 'Director');
      directorCache[movieId] = director ? director.name : 'Unknown';
    } else {
      directorCache[movieId] = 'Unknown';
    }
    
    return directorCache[movieId];
  } catch (error) {
    console.error(`⚠️  Error fetching director for ${movieId}`);
    directorCache[movieId] = 'Unknown';
    return 'Unknown';
  }
}

async function fetchAllRatedMovies() {
  let allMovies = [];
  let page = 1;
  let totalPages = 1;

  console.log('\n🎬 Fetching rated movies from TMDB...\n');

  while (page <= totalPages) {
    try {
      const url = `${BASE_URL}/account/${ACCOUNT_ID}/rated/movies?page=${page}&sort_by=created_at.desc`;
      
      console.log(`📄 Page ${page}...`);
      const data = await httpsGet(url);
      
      if (!data.results) {
        console.error('❌ No results in response');
        break;
      }
      
      allMovies = allMovies.concat(data.results);
      totalPages = data.total_pages || 1;
      
      console.log(`   ✓ ${data.results.length} movies (Total: ${allMovies.length}/${data.total_results})`);
      
      page++;
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`❌ Error on page ${page}:`, error.message);
      break;
    }
  }

  return allMovies;
}

async function transformMovie(movie) {
  const director = await getDirector(movie.id);
  
  return {
    poster: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : '',
    title: movie.title || 'Unknown',
    year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : 0,
    director: director,
    rating: Math.round(movie.rating || 0)
  };
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  TMDB Movie Sync - KinoMoyo           ║');
  console.log('║  Account: 21728623                    ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    const movies = await fetchAllRatedMovies();
    console.log(`\n✅ Fetched ${movies.length} movies\n`);

    if (movies.length === 0) {
      console.error('❌ No movies found!');
      process.exit(1);
    }

    console.log('🔄 Fetching director info...');
    const transformed = [];
    
    for (let i = 0; i < movies.length; i++) {
      try {
        const t = await transformMovie(movies[i]);
        if (t.poster) { // Only add if has poster
          transformed.push(t);
        }
        
        if ((i + 1) % 100 === 0) {
          console.log(`   → Processed ${i + 1}/${movies.length}`);
        }
        
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        console.error(`⚠️  Error with movie ${movies[i].id}`);
      }
    }

    // Sort by rating descending
    transformed.sort((a, b) => b.rating - a.rating);

    const content = `export const films = ${JSON.stringify(transformed, null, 2)};\n`;
    const filePath = path.join(__dirname, 'config.js');
    
    fs.writeFileSync(filePath, content);
    
    const sizeKB = (Buffer.byteLength(content) / 1024).toFixed(2);
    console.log(`\n✅ Generated config.js`);
    console.log(`   📦 Size: ${sizeKB} KB`);
    console.log(`   🎬 Movies: ${transformed.length}`);
    console.log(`   ⭐ Top rated: "${transformed[0].title}" (${transformed[0].rating})`);
    console.log(`\n✨ Done!\n`);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  }
}

main();

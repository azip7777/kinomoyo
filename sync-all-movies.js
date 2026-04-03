#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMTUzZDAzOTZhMTQxNzFlOGFmNTMwYTlhOTVkMDlmZSIsIm5iZiI6MTczNTk5MjkwMi42NzkwMDAxLCJzdWIiOiI2Nzc5MjI0NjZkN2NhMDBlNzg3MjdmMGIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.sk8xtBWz9lz0P8mUHsY8pvoj5mtoyTZBiAFG5fSH2yc';
const ACCOUNT_ID = '21728623';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function httpsGet(url, headers = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`, 'Accept': 'application/json' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function main() {
    let allMovies = [];
    let page = 1;
    let totalPages = 1;

    console.log('🚀 Начинаю загрузку всех оцененных фильмов...');

    try {
        // Цикл по всем страницам TMDB (по 20 фильмов на страницу)
        while (page <= totalPages) {
            const url = `${TMDB_BASE_URL}/account/${ACCOUNT_ID}/rated/movies?page=${page}&sort_by=created_at.desc`;
            const data = await httpsGet(url);

            if (data.results) {
                allMovies = allMovies.concat(data.results);
                totalPages = data.total_pages;
                console.log(`✅ Загружено: ${allMovies.length} из ${data.total_results} (Стр. ${page}/${totalPages})`);
            }
            page++;
            // Небольшая пауза, чтобы TMDB не забанил
            await new Promise(r => setTimeout(r, 100));
        }

        const transformed = allMovies.map(movie => ({
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : '????',
            director: "Director", // Для скорости ставим заглушку, либо нужно делать доп. запросы
            rating: Math.round(movie.rating)
        }));

        const content = `export const films = ${JSON.stringify(transformed, null, 2)};`;
        fs.writeFileSync(path.join(__dirname, 'config.js'), content);
        
        console.log(`\n🎉 Готово! Файл config.js обновлен. Найдено фильмов: ${transformed.length}`);
    } catch (e) {
        console.error('ошибка:', e.message);
    }
}

main();

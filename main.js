import { films } from './config.js';

const FILMS_PER_PAGE = 50;
let currentPage = 1;
const totalPages = Math.ceil(films.length / FILMS_PER_PAGE);

function createStarRating(rating) {
  const filled = '<span class="filled">★</span>'.repeat(rating);
  const empty = '<span class="empty">★</span>'.repeat(10 - rating);
  return filled + empty;
}

// Build direct Letterboxd film URL from poster path; fallback to search if parsing fails
function letterboxdFilmUrlFromPoster(posterUrl, title, year) {
  // Try to derive slug from Letterboxd poster URL
  try {
    const match = posterUrl.match(/\/\d+-([a-z0-9-]+)-\d+-\d+-\d+-\d+-crop\.jpg/i);
    if (match && match[1]) {
      const slug = match[1];
      return `https://letterboxd.com/film/${slug}/`;
    }
  } catch (_) {}

  // Fallback: derive slug from title (direct film link, not search)
  const slugFromTitle = title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://letterboxd.com/film/${slugFromTitle}/`;
}

function createFilmCard(film) {
  return `
    <div class="film-card">
      <a href="${letterboxdFilmUrlFromPoster(film.poster, film.title, film.year)}" target="_blank" rel="noopener">
        <img src="${film.poster}" alt="${film.title}">
      </a>
      <div class="film-info">
        <div class="film-title">${film.title}</div>
        <div class="film-year">${film.year}</div>
        <div class="film-director">Directed by ${film.director}</div>
        <div class="rating">${createStarRating(film.rating)}</div>
      </div>
    </div>
  `;
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  const startIndex = (currentPage - 1) * FILMS_PER_PAGE;
  const endIndex = startIndex + FILMS_PER_PAGE;
  const pageFilms = films.slice(startIndex, endIndex);
  
  gallery.innerHTML = pageFilms.map(film => createFilmCard(film)).join('');
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  let paginationHTML = '';
  
  if (totalPages > 1) {
    paginationHTML += '<div class="pagination-buttons">';
    
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === currentPage ? 'active' : '';
      paginationHTML += `<button class="pagination-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }
    
    paginationHTML += '</div>';
  }
  
  pagination.innerHTML = paginationHTML;
}

window.changePage = function(page) {
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderGallery();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

renderGallery();
renderPagination();


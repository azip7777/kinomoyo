import { films } from './config.js';

const FILMS_PER_PAGE = 50;
let currentPage = 1;
const totalPages = Math.ceil(films.length / FILMS_PER_PAGE);

function createStarRating(rating) {
  const filled = '<span class="filled">★</span>'.repeat(rating);
  const empty = '<span class="empty">★</span>'.repeat(10 - rating);
  return filled + empty;
}

function createFilmCard(film) {
  const slug = film.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `
    <div class="film-card">
      <a href="https://letterboxd.com/film/${slug}/" target="_blank">
        <img src="${film.poster}" alt="${film.title}" loading="lazy">
      </a>
      <div class="film-info">
        <div class="film-title">${film.title}</div>
        <div class="film-year">${film.year}</div>
        <div class="rating">${createStarRating(film.rating)}</div>
      </div>
    </div>
  `;
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  const startIndex = (currentPage - 1) * FILMS_PER_PAGE;
  const pageFilms = films.slice(startIndex, startIndex + FILMS_PER_PAGE);
  gallery.innerHTML = pageFilms.map(film => createFilmCard(film)).join('');
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (totalPages <= 1) return;

  let html = '<div class="pagination-buttons">';
  
  // Логика сокращенной пагинации
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) html += `<span>...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span>...</span>`;
    html += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  html += '</div>';
  pagination.innerHTML = html;
}

window.changePage = function(page) {
  currentPage = page;
  renderGallery();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

renderGallery();
renderPagination();

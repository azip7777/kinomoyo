import { films } from './config.js';

function createStarRating(rating) {
  const filled = '<span class="filled">★</span>'.repeat(rating);
  const empty = '<span class="empty">★</span>'.repeat(10 - rating);
  return filled + empty;
}

function createFilmCard(film) {
  return `
    <div class="film-card">
      <img src="${film.poster}" alt="${film.title}">
      <div class="film-title">${film.title}</div>
      <div class="film-year">${film.year}</div>
      <div class="film-director">Directed by ${film.director}</div>
      <div class="rating">${createStarRating(film.rating)}</div>
    </div>
  `;
}

function renderGallery() {
  const gallery = document.createElement('div');
  gallery.className = 'film-gallery';
  gallery.innerHTML = films.map(film => createFilmCard(film)).join('');
  document.body.appendChild(gallery);
}

renderGallery();
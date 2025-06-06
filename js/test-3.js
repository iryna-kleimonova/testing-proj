console.log('JS стартував');

const openBtns = document.querySelectorAll('.learn-more-btn');
const artistModal = document.getElementById('artistModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const artistContent = document.getElementById('artistContent');
const grid = document.getElementById('artistsGrid');

let page = 1;
const limit = 8;

async function loadArtists() {
  try {
    const response = await axios.get(
      `https://sound-wave.b.goit.study/api/artists?page=${page}&limit=${limit}`,
    );
    const artists = response.data.artists;

    artists.forEach(artist => {
      const card = document.createElement('div');
      card.className = 'artist-card';

      const tagsHTML =
        artist.genres?.map(tag => `<span class="tag">${tag}</span>`).join('') ||
        '';

      const description = artist.strBiographyEN
        ? artist.strBiographyEN.split('.').slice(0, 2).join('. ') + '...'
        : 'No description available.';

      card.innerHTML = `
        <img class="artist-thumb" src="${artist.strArtistThumb}" alt="${artist.strArtist}" />
        
        <div class="artist-tags">${tagsHTML}</div>

        <h3 class="artist-name">${artist.strArtist}</h3>
        <p class="artist-description">${description}</p>

        <button class="learn-more-btn" data-artist-id="${artist._id}">
          Learn More <span>&#9654;</span>
        </button>
      `;

      const learnMoreBtn = card.querySelector('.learn-more-btn');
      learnMoreBtn.addEventListener('click', e => {
        e.stopPropagation();
        showArtistModal(artist._id);
      });

      grid.appendChild(card);
    });

    page++; // На наступний клік — нова сторінка
  } catch (err) {
    console.error('❌ Помилка завантаження артистів:', err);
  }
}
loadArtists();
// Функція для показу модалки з інформацією про артиста

async function showArtistModal(id) {
  try {
    const res = await axios.get(
      `https://sound-wave.b.goit.study/api/artists/${id}/albums`,
    );
    const artist = res.data;

    renderArtistModal(artist); // 🔁 Єдиний правильний виклик
  } catch (error) {
    console.error('❌ Помилка модалки:', error);
    artistModal.style.display = 'flex';
    document.querySelector('.artist-title').textContent =
      'Error loading artist';
  }
}

// Закриття модалки
closeModalBtn.addEventListener('click', () => {
  artistModal.style.display = 'none';
  artistContent.innerHTML = '';
});
window.addEventListener('click', e => {
  if (e.target === artistModal) {
    artistModal.style.display = 'none';
    artistContent.innerHTML = '';
  }
});

// Початкове завантаження

closeModalBtn.addEventListener('click', () => {
  artistModal.style.display = 'none';
  artistContent.innerHTML = ''; // Очистити попередній вміст
});

window.addEventListener('click', e => {
  if (e.target === artistModal) {
    artistModal.style.display = 'none';
    artistContent.innerHTML = '';
  }
});

async function loadArtistData(artistId) {
  try {
    const response = await axios.get(
      `https://sound-wave.b.goit.study/api/artists/${artistId}/albums`,
    );
    const artist = response.data;

    renderArtistModal(artist);
    artistModal.style.display = 'block';
  } catch (error) {
    console.error('❌ Помилка при отриманні артиста:', error);
    artistContent.innerHTML = `<p>Помилка завантаження даних 😢</p>`;
    artistModal.style.display = 'block';
  }
}

function renderArtistModal(artist) {
  console.log('🔍 Rendering artist modal', artist);

  document.querySelector('.artist-title').textContent = artist.strArtist;
  document.querySelector('.artist-image').src = artist.strArtistThumb;
  document.querySelector('.artist-image').alt = artist.strArtist;

  // Базова інфа
  const formed = artist.intFormedYear || 'N/A';
  const died =
    artist.intDiedYear && artist.intDiedYear !== 'null'
      ? artist.intDiedYear
      : 'present';
  document.getElementById('years').textContent = `${formed}–${died}`;
  document.getElementById('sex').textContent = artist.strGender || 'Unknown';
  document.getElementById('members').textContent = artist.intMembers || 'N/A';
  document.getElementById('country').textContent =
    artist.strCountry || 'Unknown';

  // Біографія
  document.getElementById('bio').textContent =
    artist.strBiographyEN || 'No biography available.';
  document.getElementById('modal-tags').innerHTML =
    artist.genres?.map(tag => `<span class="tag">${tag}</span>`).join('') || '';

  // Теги (жанри)
  //   const tagsHTML =
  //     artist.genres?.map(tag => `<span class="tag">${tag}</span>`).join('') || '';
  //   document.getElementById('modal-tags').innerHTML = tagsHTML;

  // Альбоми
  const albumsContainer = document.getElementById('albumsGrid');
  albumsContainer.innerHTML = ''; // Очищення перед рендером

  if (Array.isArray(artist.albumsList) && artist.albumsList.length > 0) {
    artist.albumsList.forEach(album => {
      const albumEl = document.createElement('div');
      albumEl.className = 'album';

      const trackRows = album.tracks
        ?.map(track => {
          const durationMs = Number(track.intDuration);
          const min = Math.floor(durationMs / 60000);
          const sec = Math.floor((durationMs % 60000) / 1000)
            .toString()
            .padStart(2, '0');

          const duration = `${min}:${sec}`;
          const link = track.movie?.includes('http') ? track.movie : null;

          return `
        <li class="track-item">
          <span class="track-name">${track.strTrack}</span>
          <span class="track-duration">${duration}</span>
          ${
            link
              ? `<a class="track-link" href="${link}" target="_blank" aria-label="Listen on YouTube">▶️</a>`
              : `<span class="track-link" style="opacity: 0.3;">–</span>`
          }
        </li>
      `;
        })
        .join('');

      albumEl.innerHTML = `
      <h4 class="album-title">${album.strAlbum} (${
        album.intYearReleased || 'N/A'
      })</h4>
      <div class="track-header">
        <span>Track</span>
        <span>Time</span>
        <span>Link</span>
      </div>
      <ul class="track-list">
        ${trackRows || '<li>No tracks</li>'}
      </ul>
    `;

      albumsContainer.appendChild(albumEl);
    });
  } else {
    albumsContainer.innerHTML = '<p>No albums available.</p>';
  }

  // Показуємо модалку
  artistModal.style.display = 'flex';
}

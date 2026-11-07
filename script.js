const API_BASE = 'https://jsonplaceholder.typicode.com';

const selectEl = document.getElementById('album-select');
const searchInput = document.getElementById('search-input');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const albumDetailsEl = document.getElementById('album-details');
const authorInfoEl = document.getElementById('author-info');
const photosContainerEl = document.getElementById('photos-container');

let allAlbums = [];

async function fetchAlbums() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    try {
        const response = await fetch(`${API_BASE}/albums`);
        if (!response.ok) throw new Error(`HTTP ошибка! Статус: ${response.status}`);
        
        allAlbums = await response.json();
        renderSelectOptions(allAlbums);
    } catch (error) {
        errorEl.textContent = `Не удалось загрузить альбомы: ${error.message}`;
        errorEl.classList.remove('hidden');
        selectEl.innerHTML = '<option value="">Ошибка загрузки</option>';
    } finally {
        loadingEl.classList.add('hidden');
    }
}

function renderSelectOptions(albums) {
    const currentValue = selectEl.value;
    selectEl.innerHTML = '<option value="">-- Выберите альбом --</option>';
    
    albums.forEach(album => {
        const option = document.createElement('option');
        option.value = album.id;
        option.textContent = `${album.id}. ${album.title}`;
        selectEl.appendChild(option);
    });

    if (currentValue && albums.some(a => a.id == currentValue)) {
        selectEl.value = currentValue;
    } else {
        albumDetailsEl.classList.add('hidden');
    }
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filteredAlbums = allAlbums.filter(album => 
        album.title.toLowerCase().includes(query)
    );
    renderSelectOptions(filteredAlbums);
});

selectEl.addEventListener('change', async (e) => {
    const albumId = e.target.value;
    
    authorInfoEl.innerHTML = '';
    photosContainerEl.innerHTML = '';
    
    if (!albumId) {
        albumDetailsEl.classList.add('hidden');
        return;
    }

    albumDetailsEl.classList.remove('hidden');
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    authorInfoEl.innerHTML = '<p>Загрузка информации об авторе...</p>';

    const selectedAlbum = allAlbums.find(a => a.id == albumId);

    try {
        const [userResponse, photosResponse] = await Promise.all([
            fetch(`${API_BASE}/users/${selectedAlbum.userId}`),
            fetch(`${API_BASE}/photos?albumId=${selectedAlbum.id}`)
        ]);

        if (!userResponse.ok) throw new Error(`Ошибка загрузки автора: ${userResponse.status}`);
        if (!photosResponse.ok) throw new Error(`Ошибка загрузки фото: ${photosResponse.status}`);

        const user = await userResponse.json();
        const photos = await photosResponse.json();

        renderAuthorInfo(user, photos.length);
        renderPhotos(photos);

    } catch (error) {
        authorInfoEl.innerHTML = '';
        errorEl.textContent = `Произошла ошибка: ${error.message}`;
        errorEl.classList.remove('hidden');
    } finally {
        loadingEl.classList.add('hidden');
    }
});

function renderAuthorInfo(user, photoCount) {
    authorInfoEl.innerHTML = `
        <h3>Автор альбома</h3>
        <p><b>Имя:</b> ${user.name}</p>
        <p><b>Username:</b> ${user.username}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Фотографий:</b> ${photoCount}</p>
    `;
}

function renderPhotos(photos) {
    const htmlString = photos.map(photo => `
        <div class="photo-card">
            <a href="${photo.url}" target="_blank" rel="noopener noreferrer">
                <img src="${photo.thumbnailUrl}" alt="${photo.title}">
            </a>
            <div class="photo-title" title="${photo.title}">${photo.title}</div>
        </div>
    `).join('');
    
    photosContainerEl.innerHTML = htmlString;
}

document.addEventListener('DOMContentLoaded', fetchAlbums);
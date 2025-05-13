document.addEventListener('DOMContentLoaded', () => {
  // Элементы DOM
  const elements = {
    rosterContainer: document.getElementById('roster-container'),
    titlesContainer: document.getElementById('titles-container'),
    wrestlerPopup: document.getElementById('wrestler-popup'),
    titlePopup: document.getElementById('title-popup'),
    wrestlerPopupBody: document.getElementById('wrestler-popup-body'),
    titlePopupBody: document.getElementById('title-popup-body')
  };

  // Инициализация
  init();

  async function init() {
    try {
      console.log("Загрузка данных...");
      
      const [rosterData, titlesData] = await Promise.all([
        loadData('roster.json'),
        loadData('titles.json')
      ]);

      console.log("Данные загружены:", { rosterData, titlesData });
      
      if (rosterData.length > 0) {
        renderRoster(rosterData);
      } else {
        console.warn("Roster data is empty");
        elements.rosterContainer.innerHTML = '<p>No wrestlers found</p>';
      }

      if (titlesData.length > 0) {
        renderTitles(titlesData);
      } else {
        console.warn("Titles data is empty");
        elements.titlesContainer.innerHTML = '<p>No titles found</p>';
      }

    } catch (error) {
      console.error("Ошибка инициализации:", error);
      showError();
    }
  }

  async function loadData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Ошибка загрузки ${url}:`, error);
      return [];
    }
  }

  function renderRoster(roster) {
    elements.rosterContainer.innerHTML = '';
    
    try {
      // Создаем копию массива и сортируем
      const sortedRoster = Array.isArray(roster) 
        ? [...roster].sort((a, b) => {
            // Проверяем наличие свойства name
            const nameA = a?.name?.toUpperCase() || '';
            const nameB = b?.name?.toUpperCase() || '';
            return nameA.localeCompare(nameB);
          })
        : [];
  
      if (sortedRoster.length === 0) {
        elements.rosterContainer.innerHTML = '<p>No wrestlers available</p>';
        return;
      }
  
      sortedRoster.forEach(wrestler => {
        const card = document.createElement('div');
        card.className = 'wrestler-card';
        card.innerHTML = `
          <img src="roster/${wrestler.image || 'placeholder.jpg'}" 
               alt="${wrestler.name}" 
               onerror="this.src='placeholder.jpg'">
          <h3>${wrestler.name}</h3>
        `;
        card.addEventListener('click', () => showWrestlerPopup(wrestler));
        elements.rosterContainer.appendChild(card);
      });
  
    } catch (error) {
      console.error('Error rendering roster:', error);
      elements.rosterContainer.innerHTML = '<p>Error loading wrestlers</p>';
    }
  }

  function renderTitles(titles) {
    elements.titlesContainer.innerHTML = '';
    
    titles.forEach(title => {
      const card = document.createElement('div');
      card.className = 'title-card';
      
      // Проверка наличия изображения
      const imgSrc = title.image 
        ? `titles/${title.image}` 
        : 'title-placeholder.jpg';
      
      card.innerHTML = `
        <img src="${imgSrc}" alt="${title.name}" onerror="this.src='title-placeholder.jpg'">
        <h3>${title.name}</h3>
        <p>${title.champion}</p>
      `;
      
      card.addEventListener('click', () => showTitlePopup(title));
      elements.titlesContainer.appendChild(card);
    });
  }

  function showWrestlerPopup(wrestler) {
    const popup = document.getElementById('wrestler-popup');
    const popupBody = document.getElementById('wrestler-popup-body');
    
    popupBody.innerHTML = `
      <img class="popup-image" src="roster/${wrestler.image}" alt="${wrestler.name}" 
           onerror="this.src='placeholder.jpg'">
      <div class="popup-info">
        <h2>${wrestler.name}</h2>
        ${wrestler.team ? `<p><strong>Команда:</strong> ${wrestler.team}</p>` : ''}
        ${wrestler.title ? `<p><strong>Титул:</strong> ${wrestler.title}</p>` : ''}
        ${wrestler.achievements?.length ? `
          <div class="achievements">
            <strong>Достижения:</strong>
            <ul>${wrestler.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
          </div>` : ''}
      </div>
    `;
    popup.style.display = 'flex';
  }
  
  function showTitlePopup(title) {
    const popup = document.getElementById('title-popup');
    const popupBody = document.getElementById('title-popup-body');
  
    // Определяем термины в зависимости от типа
    const terms = {
      champion: 
        title.type === 'contract' ? 'Обладатель' :
        title.type === 'rttt' ? 'Победитель' : 'Чемпион',
      
      previous: 
        title.type === 'contract' ? 'Бывшие обладатели' :
        title.type === 'rttt' ? 'Бывшие победители' : 'Бывшие чемпионы'
    };
  
    popupBody.innerHTML = `
      <img class="popup-image" src="titles/${title.image}" alt="${title.name}" 
           onerror="this.src='title-placeholder.jpg'">
      <div class="popup-info">
        <h2>${title.name}</h2>
        ${title.champion ? `<p><strong>${terms.champion}:</strong> ${title.champion}</p>` : ''}
        ${title.date_won ? `<p><strong>Дата выигрыша:</strong> ${title.date_won}</p>` : ''}
        ${title.previous_holders?.filter(h => h).length ? `
          <div class="previous-holders">
            <strong>${terms.previous}:</strong>
            <ul>${title.previous_holders.filter(h => h).map(h => `<li>${h}</li>`).join('')}</ul>
          </div>` : ''}
      </div>
    `;
    popup.style.display = 'flex';
  }

  function showError() {
    elements.rosterContainer.innerHTML = `
      <div class="error">
        <p>Произошла ошибка при загрузке данных</p>
        <p>Проверьте консоль для подробностей</p>
      </div>
    `;
    elements.titlesContainer.innerHTML = '';
  }

  // Закрытие поп-апов
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('wrestler-popup').style.display = 'none';
      document.getElementById('title-popup').style.display = 'none';
    });
  });

  // Закрытие по клику вне контента
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('popup')) {
      e.target.style.display = 'none';
    }
  });
});
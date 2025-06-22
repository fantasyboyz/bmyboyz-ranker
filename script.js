
let trainees = [];
const container = document.getElementById('trainee-list');
const copyBtn = document.getElementById('copyLink');

// Función para crear la tarjeta de un trainee
function createCard(trainee, index) {
  const card = document.createElement('div');
  card.classList.add('card');
  if (index < 8) card.classList.add('top8');
  card.setAttribute('draggable', true);
  card.dataset.index = index;
  card.dataset.name = trainee.name;

  card.innerHTML = `
    <img src="${trainee.image}" alt="${trainee.name}">
    <h3>${trainee.name}</h3>
  `;

  card.addEventListener('dragstart', dragStart);
  card.addEventListener('dragover', dragOver);
  card.addEventListener('drop', drop);
  card.addEventListener('dragend', dragEnd);

  return card;
}

let dragSrcEl = null;

function dragStart(e) {
  dragSrcEl = e.currentTarget;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  e.currentTarget.classList.add('dragging');
}

function dragOver(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target && target !== dragSrcEl && target.classList.contains('card')) {
    const bounding = target.getBoundingClientRect();
    const offset = e.clientX - bounding.left;
    if (offset > bounding.width / 2) {
      target.style['border-right'] = '4px solid #A0EACD';
      target.style['border-left'] = '';
    } else {
      target.style['border-left'] = '4px solid #A0EACD';
      target.style['border-right'] = '';
    }
  }
}

function drop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target && target !== dragSrcEl && target.classList.contains('card')) {
    target.style['border-left'] = '';
    target.style['border-right'] = '';
    const draggedHTML = e.dataTransfer.getData('text/html');
    if (draggedHTML) {
      const container = document.getElementById('trainee-list');
      let draggedIndex = parseInt(dragSrcEl.dataset.index);
      let targetIndex = parseInt(target.dataset.index);

      if (e.clientX - target.getBoundingClientRect().left > target.offsetWidth / 2) {
        targetIndex++;
      }

      if (draggedIndex < targetIndex) targetIndex--;

      trainees.splice(targetIndex, 0, trainees.splice(draggedIndex, 1)[0]);
      renderCards();
      saveRankingToUrl();
    }
  }
}

function dragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style['border-left'] = '';
    card.style['border-right'] = '';
  });
}

// Renderiza todas las tarjetas
function renderCards() {
  container.innerHTML = '';
  trainees.forEach((t, i) => {
    const card = createCard(t, i);
    container.appendChild(card);
  });
}

// Guarda el ranking en el hash de la URL
function saveRankingToUrl() {
  const names = trainees.map(t => encodeURIComponent(t.name));
  const hash = names.join(',');
  history.replaceState(null, '', '#' + hash);
}

// Carga el ranking desde la URL si existe
function loadRankingFromUrl() {
  const hash = decodeURIComponent(window.location.hash.substring(1));
  if (!hash) return false;

  const names = hash.split(',');
  if (names.length !== trainees.length) return false;

  const newOrder = [];
  for (const name of names) {
    const found = trainees.find(t => t.name === name);
    if (found) newOrder.push(found);
    else return false;
  }
  trainees = newOrder;
  return true;
}

// Evento para copiar el link con el ranking actual
copyBtn.addEventListener('click', () => {
  saveRankingToUrl();
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('¡Link copiado! Puedes compartir tu ranking.');
  });
});

// Inicio
fetch('trainees.json')
  .then(res => res.json())
  .then(data => {
    trainees = data;
    if (!loadRankingFromUrl()) {
      // Si no hay ranking guardado, ordenar por edad (más joven primero)
      trainees.sort((a,b) => new Date(a.birthday) - new Date(b.birthday));
    }
    renderCards();
  });

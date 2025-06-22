
let trainees = [];
let top8 = [];

function renderTop8() {
  const container = document.getElementById("top8-list");
  container.innerHTML = '';
  top8.forEach((trainee, index) => {
    const card = document.createElement("div");
    card.className = "card selected";
    card.innerHTML = `<img src="${trainee.image}" alt="${trainee.name}"><span>#${index + 1} ${trainee.name}</span>`;
    card.onclick = () => {
      top8 = top8.filter(t => t.name !== trainee.name);
      renderTop8();
      renderPool();
      saveToUrl();
    };
    container.appendChild(card);
  });
}

function renderPool() {
  const container = document.getElementById("trainee-pool");
  container.innerHTML = '';
  trainees.forEach(trainee => {
    if (top8.find(t => t.name === trainee.name)) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<img src="${trainee.image}" alt="${trainee.name}"><span>${trainee.name}</span>`;
    card.onclick = () => {
      if (top8.length < 8) {
        top8.push(trainee);
        renderTop8();
        renderPool();
        saveToUrl();
      } else {
        alert("You can only select 8 trainees.");
      }
    };
    container.appendChild(card);
  });
}

function saveToUrl() {
  const names = top8.map(t => encodeURIComponent(t.name));
  const hash = names.join(",");
  history.replaceState(null, "", "#" + hash);
}

function loadFromUrl() {
  const hash = decodeURIComponent(window.location.hash.substring(1));
  if (!hash) return;
  const names = hash.split(",");
  top8 = [];
  names.forEach(name => {
    const t = trainees.find(t => t.name === name);
    if (t && !top8.includes(t) && top8.length < 8) {
      top8.push(t);
    }
  });
}

document.getElementById("copyLink").onclick = () => {
  saveToUrl();
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert("Link copied to clipboard!");
  });
};

fetch("trainees.json")
  .then(res => res.json())
  .then(data => {
    trainees = data;
    loadFromUrl();
    renderTop8();
    renderPool();
  });

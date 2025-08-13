async function renderResources() {
  const container = document.getElementById('resources');
  const resources = await fetchJSON('/data/resources.json');
  container.innerHTML = '';
  resources.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${r.title}</h3>
      <div class="badge">${r.type}</div>
      <a class="button" href="${r.link}" target="_blank" rel="noopener">Open</a>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderResources);
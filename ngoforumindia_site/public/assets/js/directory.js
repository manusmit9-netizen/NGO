let allNgos = [];

function normalize(str) { return (str || '').toLowerCase().trim(); }

function unique(arr) { return Array.from(new Set(arr)); }

function renderDirectory(ngos) {
  const results = document.getElementById('results');
  const count = document.getElementById('count');
  results.innerHTML = '';
  count.textContent = String(ngos.length);

  ngos.forEach(org => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${org.name}</h3>
      <div class="badge">${org.sector}</div>
      <p style="margin:8px 0 10px; color: var(--color-muted);">${org.location}</p>
      ${org.website ? `<a class="button" href="${org.website}" target="_blank" rel="noopener">Visit website</a>` : ''}
    `;
    results.appendChild(card);
  });
}

function applyFilters() {
  const q = normalize(document.getElementById('q').value);
  const sector = normalize(document.getElementById('sector').value);
  const location = normalize(document.getElementById('location').value);

  const filtered = allNgos.filter(org => {
    const nameMatch = !q || normalize(org.name).includes(q) || normalize(org.sector).includes(q) || normalize(org.location).includes(q);
    const sectorMatch = !sector || normalize(org.sector) === sector;
    const locationMatch = !location || normalize(org.location).includes(location);
    return nameMatch && sectorMatch && locationMatch;
  });

  renderDirectory(filtered);
}

async function initDirectory() {
  allNgos = await fetchJSON('/data/ngos.json');
  const sectorSelect = document.getElementById('sector');
  unique(allNgos.map(o => o.sector)).sort().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s; sectorSelect.appendChild(opt);
  });

  document.getElementById('q').addEventListener('input', applyFilters);
  document.getElementById('sector').addEventListener('change', applyFilters);
  document.getElementById('location').addEventListener('input', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('q').value = '';
    document.getElementById('sector').value = '';
    document.getElementById('location').value = '';
    applyFilters();
  });

  applyFilters();
}

document.addEventListener('DOMContentLoaded', initDirectory);
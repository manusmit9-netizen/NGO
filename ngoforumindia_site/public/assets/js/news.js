async function renderNews() {
  const container = document.getElementById('news');
  const news = await fetchJSON('/data/news.json');
  container.innerHTML = '';
  news.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <div class="badge">${formatDate(item.date)}</div>
      <p>${item.summary || ''}</p>
      <a class="button" href="${item.url}" target="_blank" rel="noopener">Read more</a>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderNews);
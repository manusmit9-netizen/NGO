async function renderHome() {
  try {
    const [news, events] = await Promise.all([
      fetchJSON('/data/news.json'),
      fetchJSON('/data/events.json')
    ]);

    const newsList = document.getElementById('news-list');
    if (newsList) {
      news.slice(0, 4).forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${item.title}</h3>
          <div class="badge">${formatDate(item.date)}</div>
          <p>${item.summary || ''}</p>
          <a class="button" href="${item.url}" target="_blank" rel="noopener">Read more</a>
        `;
        newsList.appendChild(card);
      });
    }

    const evList = document.getElementById('events-list');
    if (evList) {
      events.slice(0, 4).forEach(ev => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${ev.title}</h3>
          <div class="badge">${formatDate(ev.date)} • ${ev.location}</div>
          <p>${ev.description || ''}</p>
          <a class="button" href="/events.html">Register</a>
        `;
        evList.appendChild(card);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', renderHome);
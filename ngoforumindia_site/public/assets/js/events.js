async function renderEvents() {
  const container = document.getElementById('events');
  const events = await fetchJSON('/data/events.json');
  container.innerHTML = '';

  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'card';
    const formId = `form-${btoa(ev.title).replace(/=/g,'')}`;
    card.innerHTML = `
      <h3>${ev.title}</h3>
      <div class="badge">${formatDate(ev.date)} • ${ev.location}</div>
      <p>${ev.description || ''}</p>
      <form id="${formId}" class="form" data-api="/api/event-register" style="margin-top:12px;">
        <input type="hidden" name="event" value="${ev.title}" />
        <div class="form-row">
          <div><label>Name</label><input name="name" required /></div>
          <div><label>Email</label><input name="email" type="email" required /></div>
        </div>
        <div class="form-row">
          <div><label>Organization</label><input name="organization" /></div>
          <div><label>Phone</label><input name="phone" /></div>
        </div>
        <button class="button" type="submit">Register</button>
        <span class="badge hidden">Submitting…</span>
      </form>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderEvents);
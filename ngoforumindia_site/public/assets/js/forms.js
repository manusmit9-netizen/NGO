function toJSON(form) {
  const data = {};
  Array.from(new FormData(form).entries()).forEach(([k, v]) => data[k] = v);
  return data;
}

async function submitForm(event) {
  event.preventDefault();
  const form = event.target;
  const endpoint = form.getAttribute('data-api');
  const statusBadge = form.querySelector('.badge');
  if (!endpoint) return;
  try {
    statusBadge && statusBadge.classList.remove('hidden');
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toJSON(form)) });
    if (!res.ok) throw new Error('Request failed');
    form.reset();
    alert('Thank you! We have received your submission.');
  } catch (e) {
    console.error(e);
    alert('Sorry, something went wrong. Please try again later.');
  } finally {
    statusBadge && statusBadge.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-api]').forEach(f => f.addEventListener('submit', submitForm));
});
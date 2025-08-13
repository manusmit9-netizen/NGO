function $(selector, root = document) { return root.querySelector(selector); }
function $all(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }

function toggleNav() {
  const nav = $('.nav-links');
  if (nav) nav.classList.toggle('open');
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function setActiveNav() {
  const path = location.pathname.replace(/\/index\.html$/, '/');
  $all('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    const normalized = href === '/' ? '/' : href;
    if (normalized === path) {
      a.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNav);
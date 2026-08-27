import './styles.css';
import { messages, resolveLocale } from './locale';
import { supportConfig } from './config/support';
import { fetchSourceData } from './data';
import { searchGdelt } from './data/gdelt';
import type { Story } from './domain';

const locale = resolveLocale();
const t = messages[locale];

document.documentElement.lang = locale;

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const support = supportConfig.enabled && supportConfig.url
  ? `<a class="support-link" href="${escapeHtml(supportConfig.url)}" target="_blank" rel="noopener noreferrer">☕ ${t.supportLabel}</a>`
  : '';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="topbar">
    <a class="brand" href="./" aria-label="GlobS home">
      <span class="brand-mark">G</span><span>GlobS</span><small>World Explorer</small>
    </a>
    <div class="top-actions"><button class="icon-button" type="button" aria-label="Search">⌕</button><button class="icon-button" type="button" aria-label="Menu">☰</button></div>
  </header>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">WORLD — NOW</p>
      <h1>Explore the world.</h1>
      <p class="hero-copy">Discover current information, emerging events, and the sources behind them.</p>
      <form class="search" id="search-form" role="search">
        <label class="sr-only" for="search-input">${t.explore}</label>
        <input id="search-input" type="search" placeholder="${t.searchPlaceholder}" autocomplete="off" />
        <button type="submit">Explore</button>
      </form>
    </section>
    <section class="content-grid" aria-label="World discovery">
      <article class="panel featured"><div class="panel-heading"><span>🔥</span><h2>${t.trending}</h2></div><div id="trending-list" class="story-list"><p class="muted">${t.loading}</p></div></article>
      <article class="panel map-panel"><div class="panel-heading"><span>🌍</span><h2>${t.worldNow}</h2></div><div class="map-placeholder" role="img" aria-label="World map preview"><div class="map-grid"></div><span class="map-dot dot-a"></span><span class="map-dot dot-b"></span><span class="map-dot dot-c"></span><span class="map-dot dot-d"></span><span class="map-dot dot-e"></span><p>Geographic exploration</p></div></article>
      <article class="panel latest-panel"><div class="panel-heading"><span>◷</span><h2>${t.latest}</h2></div><div id="latest-list" class="story-list"><p class="muted">${t.loading}</p></div></article>
    </section>
  </main>
  <footer class="footer"><span>GlobS — World Explorer</span>${support}</footer>
`;

function renderStories(containerId: string, stories: Story[], emptyMessage: string) {
  const container = document.querySelector<HTMLDivElement>(`#${containerId}`);
  if (!container) return;
  if (!stories.length) {
    container.innerHTML = `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
    return;
  }
  container.innerHTML = stories.map((story) => `
    <a class="story" href="${escapeHtml(story.source.url)}" target="_blank" rel="noopener noreferrer">
      <div class="story-main"><b>${escapeHtml(story.headline)}</b><small>${escapeHtml(story.source.title ?? story.source.url)}</small></div>
      <time datetime="${escapeHtml(story.publishedAt ?? '')}">${escapeHtml(formatDate(story.publishedAt))}</time>
    </a>
  `).join('');
}

async function loadWorld() {
  const result = await fetchSourceData();
  const records = result.flatMap((item) => item.records);
  const stories = records.map((record) => record.story);
  renderStories('latest-list', stories, t.unavailable);
  renderStories('trending-list', stories.slice(0, 5), t.unavailable);
}

void loadWorld();

document.querySelector<HTMLFormElement>('#search-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector<HTMLInputElement>('#search-input');
  const query = input?.value.trim();
  if (!query) return;

  const latest = document.querySelector<HTMLDivElement>('#latest-list');
  const trending = document.querySelector<HTMLDivElement>('#trending-list');
  if (latest) latest.innerHTML = `<p class="muted">${escapeHtml(t.loading)}</p>`;
  if (trending) trending.innerHTML = `<p class="muted">${escapeHtml(t.loading)}</p>`;

  try {
    const records = await searchGdelt(query);
    const stories = records.map((record) => record.story);
    renderStories('latest-list', stories, t.unavailable);
    renderStories('trending-list', stories.slice(0, 5), t.unavailable);
  } catch {
    renderStories('latest-list', [], t.unavailable);
    renderStories('trending-list', [], t.unavailable);
  }
});

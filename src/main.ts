import './styles.css';
import { messages, resolveLocale } from './locale';
import { supportConfig } from './config/support';

const locale = resolveLocale();
const t = messages[locale];

const support = supportConfig.enabled && supportConfig.url
  ? `<a class="support-link" href="${supportConfig.url}" target="_blank" rel="noopener noreferrer">☕ ${t.supportLabel}</a>`
  : '';

document.documentElement.lang = locale;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="topbar">
    <a class="brand" href="/" aria-label="GlobS home">
      <span class="brand-mark">G</span>
      <span>GlobS</span>
      <small>World Explorer</small>
    </a>
    <div class="top-actions">
      <button class="icon-button" type="button" aria-label="Search">⌕</button>
      <button class="icon-button" type="button" aria-label="Menu">☰</button>
    </div>
  </header>

  <main class="page">
    <section class="hero">
      <p class="eyebrow">WORLD — NOW</p>
      <h1>Explore the world.</h1>
      <p class="hero-copy">Discover current information, emerging events, and the sources behind them.</p>
      <form class="search" role="search">
        <label class="sr-only" for="search-input">${t.explore}</label>
        <input id="search-input" type="search" placeholder="${t.searchPlaceholder}" autocomplete="off" />
        <button type="submit">Explore</button>
      </form>
    </section>

    <section class="content-grid" aria-label="World discovery">
      <article class="panel featured">
        <div class="panel-heading"><span>🔥</span><h2>${t.trending}</h2></div>
        <div class="placeholder-list">
          <div class="placeholder-item"><span></span><div><b>World information will appear here</b><small>Source-aware discovery</small></div></div>
          <div class="placeholder-item"><span></span><div><b>Live sources are being connected</b><small>Multi-source architecture</small></div></div>
          <div class="placeholder-item"><span></span><div><b>Events will be correlated</b><small>Context, time, and place</small></div></div>
        </div>
      </article>

      <article class="panel map-panel">
        <div class="panel-heading"><span>🌍</span><h2>${t.worldNow}</h2></div>
        <div class="map-placeholder" role="img" aria-label="World map placeholder">
          <div class="map-grid"></div>
          <span class="map-dot dot-a"></span><span class="map-dot dot-b"></span><span class="map-dot dot-c"></span>
          <span class="map-dot dot-d"></span><span class="map-dot dot-e"></span>
          <p>Geographic exploration</p>
        </div>
      </article>

      <article class="panel latest-panel">
        <div class="panel-heading"><span>◷</span><h2>${t.latest}</h2></div>
        <p class="muted">${t.loading}</p>
      </article>
    </section>
  </main>

  <footer class="footer">
    <span>GlobS — World Explorer</span>
    ${support}
  </footer>
`;

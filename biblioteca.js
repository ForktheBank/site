(() => {
  const data = window.libraryData;
  const grid = document.querySelector('#library-grid');
  const index = document.querySelector('#library-index');
  const search = document.querySelector('#library-search');
  const count = document.querySelector('#library-count');
  const tabs = [...document.querySelectorAll('.library-tab')];
  const state = { source: 'glossary', search: '', letter: '' };
  const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const termFromCryptopedia = (text) => {
    const marker = text.indexOf(' significa ');
    if (marker > 0) return text.slice(0, marker);
    const verb = text.search(/\s(é|são|refere-se)\s/i);
    return verb > 0 ? text.slice(0, verb) : text.slice(0, 42);
  };
  function entries() {
    if (state.source === 'glossary') return data.glossary;
    return data.cryptopedia.map((item) => ({ term: termFromCryptopedia(item.text), definition: item.text, letter: normalize(termFromCryptopedia(item.text)).charAt(0).toUpperCase() }));
  }
  function renderIndex(list) {
    const letters = [...new Set(list.map((item) => normalize(item.term).charAt(0).toUpperCase()).filter((letter) => /[A-Z]/.test(letter)))].sort();
    index.hidden = state.source !== 'glossary';
    if (state.source !== 'glossary') { index.innerHTML = ''; return; }
    index.innerHTML = `<button class="${!state.letter ? 'is-active' : ''}" type="button" data-letter="">Todos</button>${letters.map((letter) => `<button class="${state.letter === letter ? 'is-active' : ''}" type="button" data-letter="${letter}">${letter}</button>`).join('')}`;
    index.querySelectorAll('[data-letter]').forEach((button) => button.addEventListener('click', () => { state.letter = button.dataset.letter; render(); }));
  }
  function render() {
    const all = entries();
    const needle = normalize(state.search);
    const visible = all.filter((item) => {
      const text = `${item.term} ${item.definition}`;
      const hasText = !needle || normalize(text).includes(needle);
      const initial = normalize(item.term).charAt(0).toUpperCase();
      return hasText && (!state.letter || initial === state.letter);
    });
    count.textContent = `${visible.length} ${visible.length === 1 ? 'termo' : 'termos'} disponíveis`;
    grid.innerHTML = visible.length ? visible.map((item) => `<article class="term-card"><h2>${esc(item.term)}</h2><p>${esc(item.definition)}</p><small>${state.source === 'glossary' ? `GLOSSÁRIO · ${esc(item.letter)}` : 'CRYPTOPEDIA'}</small></article>`).join('') : '<p class="library-empty">Nenhum termo encontrado. Tente outra busca.</p>';
    renderIndex(all);
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    state.source = tab.dataset.library;
    state.letter = '';
    state.search = '';
    search.value = '';
    tabs.forEach((item) => { const active = item === tab; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', active); });
    render();
  }));
  search.addEventListener('input', () => { state.search = search.value; state.letter = ''; render(); });
  document.querySelector('#year').textContent = new Date().getFullYear();
  render();
})();

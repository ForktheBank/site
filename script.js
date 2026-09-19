(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const quiz = $('#quiz-dialog');
  const app = $('#quiz-app');
  const questions = [
    { tag: 'QUALIFICAÇÃO', question: 'Você possui ativos digitais atualmente?', sub: 'Bitcoin, stablecoins ou outro criptoativo.', options: [{ text: 'Sim — já tenho um portfólio relevante', risk: 0 }, { text: 'Sim — ainda estou construindo minha posição', risk: 0 }, { text: 'Tenho pouco, mas pretendo aumentar em breve', risk: 0 }, { text: 'Ainda não, mas estou prestes a entrar nesse mercado', risk: 0 }] },
    { tag: 'CUSTÓDIA', question: 'Onde está guardado o seu patrimônio digital hoje?', sub: 'Esta é uma pergunta central para compreender dependências e responsabilidades.', options: [{ text: 'Em uma exchange ou corretora', risk: 3 }, { text: 'Em hardware wallet sob meu controle', risk: 0 }, { text: 'Em carteira de software; tenho a seed phrase', risk: 1 }, { text: 'Dividido entre exchange e carteira própria', risk: 2 }] },
    { tag: 'CHAVES', question: 'Você sabe o que é uma seed phrase e como ela deve ser tratada?', sub: 'Ela é um elemento crítico de acesso. Nunca informe ou digite sua seed phrase neste site.', options: [{ text: 'Sim — mantenho uma estratégia física documentada', risk: 0 }, { text: 'Sim — mas não sei dizer onde está agora', risk: 3 }, { text: 'Já ouvi falar, mas não compreendo bem', risk: 3 }, { text: 'Nunca vi esse termo antes', risk: 3 }] },
    { tag: 'DEPENDÊNCIA', question: 'Se a plataforma que você usa ficasse indisponível, como isso afetaria seus ativos?', sub: 'Considere acesso, movimentação e as informações necessárias para recuperar sua posição.', options: [{ text: 'Não mantenho ativos em plataformas de terceiros', risk: 0 }, { text: 'Dependeria dela para acessar uma parte importante', risk: 3 }, { text: 'Não sei exatamente como seria', risk: 2 }, { text: 'Nunca parei para pensar nessa hipótese', risk: 3 }] },
    { tag: 'CONTINUIDADE', question: 'Se algo acontecesse com você, alguém de confiança saberia acessar seus ativos?', sub: 'Organização e documentação podem ser parte relevante do planejamento patrimonial.', options: [{ text: 'Sim — existe um plano documentado e revisado', risk: 0 }, { text: 'Tenho instruções informais, sem estrutura definida', risk: 2 }, { text: 'Provavelmente teriam dificuldade', risk: 3 }, { text: 'Não; não há nenhuma orientação preparada', risk: 3 }] },
    { tag: 'AMEAÇA PRINCIPAL', question: 'Qual situação mais preocupa você em relação ao patrimônio digital?', sub: 'Escolha a que mais pesa hoje.', options: [{ text: 'Falha ou indisponibilidade de uma plataforma', risk: 1 }, { text: 'Golpes, phishing ou engenharia social', risk: 1 }, { text: 'Perder o acesso às minhas próprias carteiras', risk: 1 }, { text: 'Não saber por onde começar na segurança digital', risk: 2 }] },
    { tag: 'CONSCIÊNCIA DE RISCO', question: 'Com que frequência você revisa os riscos ligados aos seus ativos digitais?', sub: 'Uma resposta honesta ajuda a indicar o próximo tema de aprendizado.', options: [{ text: 'Com frequência — é um tema recorrente para mim', risk: 2 }, { text: 'Às vezes, quando algo chama a atenção', risk: 1 }, { text: 'Raramente — prefiro não pensar nisso', risk: 2 }, { text: 'Nunca — confio totalmente na estrutura atual', risk: 3 }] }
  ];
  const levels = [
    { max: 3, name: 'BASE BEM ESTRUTURADA', color: '#3aaa6a', title: 'Você já demonstra práticas importantes de organização.', text: 'Suas respostas sugerem uma atenção consistente à autonomia e à continuidade. Use o protocolo para revisar processos, reduzir pontos únicos de falha e manter sua estrutura atualizada.' },
    { max: 9, name: 'PONTOS DE ATENÇÃO', color: '#bd9b62', title: 'Há fundamentos para fortalecer com método.', text: 'Você já identifica alguns riscos, mas existem dependências ou lacunas que merecem ser compreendidas com calma. O próximo passo é organizar prioridades e aprofundar a educação em segurança.' },
    { max: 15, name: 'EXPOSIÇÃO RELEVANTE', color: '#cc8822', title: 'Sua estrutura merece uma revisão cuidadosa.', text: 'As respostas indicam temas importantes de custódia, acesso ou continuidade a endereçar. Este diagnóstico não substitui uma análise individual, mas pode orientar por onde começar a estudar.' },
    { max: 99, name: 'ATENÇÃO PRIORITÁRIA', color: '#c85941', title: 'Comece pelos fundamentos de segurança e autonomia.', text: 'Há vários pontos que podem ser esclarecidos antes de tomar novas decisões. Priorize educação, organização e boas práticas; nunca compartilhe chaves, senhas ou seed phrases com terceiros.' }
  ];
  const state = { phase: 'intro', current: 0, score: 0, chosen: null, locked: false };
  const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  $('#year').textContent = new Date().getFullYear();
  function resetQuiz() { Object.assign(state, { phase: 'intro', current: 0, score: 0, chosen: null, locked: false }); render(); }
  function getLevel() { return levels.find((level) => state.score <= level.max); }
  function renderIntro() { return `<section class="quiz-intro quiz-fade"><span class="eyebrow">DIAGNÓSTICO EDUCATIVO</span><h2 id="quiz-title">Seu patrimônio digital está <em>bem organizado?</em></h2><p>Em cerca de dois minutos, responda sete perguntas para identificar temas de custódia, acesso e continuidade que merecem a sua atenção.</p><div class="quiz-facts"><span><b>7</b> perguntas</span><span><b>~2 min</b> para responder</span><span><b>0</b> dados pessoais</span></div><button class="dark-button" id="start-quiz" type="button">Iniciar Raio-X <span>→</span></button><small>As respostas não são enviadas ou armazenadas. Nunca informe seed phrases, senhas ou chaves privadas.</small></section>`; }
  function renderQuestion() {
    const question = questions[state.current];
    const options = question.options.map((option, index) => `<button class="quiz-option${state.chosen === index ? ' is-selected' : ''}" type="button" data-option="${index}"><span>${state.chosen === index ? '✓' : String.fromCharCode(65 + index)}</span>${esc(option.text)}</button>`).join('');
    return `<section class="quiz-question quiz-fade"><div class="quiz-progress"><span>PERGUNTA ${String(state.current + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}</span><b>${esc(question.tag)}</b></div><div class="quiz-track"><i style="width:${((state.current + 1) / questions.length) * 100}%"></i></div><h2>${esc(question.question)}</h2><p>${esc(question.sub)}</p><div class="quiz-options">${options}</div><p class="quiz-privacy">O quiz não solicita, recebe ou armazena qualquer informação sensível.</p></section>`;
  }
  function renderAnalyzing() { return `<section class="quiz-analyzing quiz-fade"><i></i><h2>Organizando suas respostas…</h2><p>O resultado é apenas educativo e serve como ponto de partida para o seu aprendizado.</p></section>`; }
  function renderResult() {
    const level = getLevel();
    const percentage = Math.min(Math.round((state.score / 18) * 100), 100);
    return `<section class="quiz-result quiz-fade"><span class="result-tag">SEU MOMENTO ATUAL</span><h2>${esc(level.name)}</h2><div class="result-card"><span style="color:${level.color}">ÍNDICE EDUCATIVO DE EXPOSIÇÃO</span><strong style="color:${level.color}">${percentage}%</strong><i><b style="width:${percentage}%;background:${level.color}"></b></i><small>Baixo <em>·</em> Atenção <em>·</em> Maior atenção</small></div><h3>${esc(level.title)}</h3><p>${esc(level.text)}</p><a class="dark-button result-cta" href="protocolo.html">Conhecer o Protocolo Soberano <span>↗</span></a><button class="restart-quiz" type="button">Refazer o Raio-X</button><small class="result-disclaimer">Este conteúdo é exclusivamente educacional e não constitui recomendação de investimento, aconselhamento financeiro ou avaliação individual.</small></section>`;
  }
  function render() {
    if (state.phase === 'intro') app.innerHTML = renderIntro();
    else if (state.phase === 'question') app.innerHTML = renderQuestion();
    else if (state.phase === 'analyzing') app.innerHTML = renderAnalyzing();
    else app.innerHTML = renderResult();
    bindQuiz();
  }
  function bindQuiz() {
    $('#start-quiz', app)?.addEventListener('click', () => { state.phase = 'question'; render(); });
    app.querySelectorAll('[data-option]').forEach((button) => button.addEventListener('click', () => {
      if (state.locked) return;
      state.locked = true;
      const optionIndex = Number(button.dataset.option);
      state.chosen = optionIndex;
      render();
      window.setTimeout(() => {
        state.score += questions[state.current].options[optionIndex].risk;
        state.chosen = null;
        state.locked = false;
        if (state.current < questions.length - 1) { state.current += 1; state.phase = 'question'; render(); }
        else { state.phase = 'analyzing'; render(); window.setTimeout(() => { state.phase = 'result'; render(); }, 550); }
      }, 260);
    }));
    $('.restart-quiz', app)?.addEventListener('click', resetQuiz);
  }
  function openQuiz() { if (quiz.open) return; resetQuiz(); quiz.showModal(); }
  document.querySelectorAll('.js-open-quiz').forEach((button) => button.addEventListener('click', openQuiz));
  $('.dialog-close').addEventListener('click', () => quiz.close());
  quiz.addEventListener('click', (event) => { if (event.target === quiz) quiz.close(); });
  /* Link direto para o Raio-X: qualquer URL terminada em #raio-x abre o quiz.
     Ex.: https://seu-dominio/#raio-x · ao fechar, o #some da barra de endereço. */
  const QUIZ_HASH = '#raio-x';
  const openQuizFromHash = () => { if (window.location.hash === QUIZ_HASH) openQuiz(); };
  quiz.addEventListener('close', () => {
    if (window.location.hash === QUIZ_HASH) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  });
  window.addEventListener('hashchange', openQuizFromHash);
  openQuizFromHash();
  const toggle = $('.menu-toggle');
  const menu = $('#mobile-menu');
  toggle.addEventListener('click', () => { const isOpen = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', isOpen); menu.classList.toggle('is-open', isOpen); });
  menu.querySelectorAll('a, button').forEach((link) => link.addEventListener('click', () => { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); }));
  document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => { const target = $(link.getAttribute('href')); if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); } }));
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

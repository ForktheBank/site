(() => {
  const app = document.querySelector('#wallet-app');
  const questions = [
    { id: 'experience', text: 'Qual é o seu nível de experiência com Bitcoin?', options: [{ value: 'beginner', label: 'Iniciante', sub: 'Ainda estou aprendendo o básico' }, { value: 'intermediate', label: 'Intermediário', sub: 'Já uso carteiras não custodiais' }, { value: 'advanced', label: 'Avançado', sub: 'Já configurei hardware wallet ou multisig' }] },
    { id: 'value', text: 'Quanto você pretende guardar nesta carteira?', options: [{ value: 'small', label: 'Até R$ 5.000', sub: 'Um valor inicial ou de uso limitado' }, { value: 'medium', label: 'De R$ 5.000 a R$ 50.000', sub: 'Um valor que pede mais processo' }, { value: 'large', label: 'Acima de R$ 50.000', sub: 'Uma estrutura que exige avaliação cuidadosa' }] },
    { id: 'usage', text: 'Como pretende usar esses bitcoins?', options: [{ value: 'savings', label: 'Reserva de longo prazo', sub: 'Pretendo movimentar pouco' }, { value: 'occasional', label: 'Uso ocasional', sub: 'Movimentações pontuais' }, { value: 'frequent', label: 'Uso frequente', sub: 'Pagamentos e pequenas movimentações' }] },
    { id: 'multisig', text: 'Você quer conhecer estruturas com mais de uma chave?', options: [{ value: 'yes', label: 'Sim', sub: 'Quero explorar multisig' }, { value: 'unsure', label: 'Ainda não sei', sub: 'Quero entender antes de decidir' }, { value: 'no', label: 'Não por enquanto', sub: 'Prefiro começar com simplicidade' }] },
    { id: 'platform', text: 'Qual plataforma você prefere no dia a dia?', options: [{ value: 'hardware', label: 'Dispositivo dedicado', sub: 'Uma hardware wallet' }, { value: 'mobile', label: 'Celular', sub: 'Android ou iPhone' }, { value: 'desktop', label: 'Computador', sub: 'Windows, macOS ou Linux' }] }
  ];
  const wallets = [
    { name: 'Blockstream Jade', type: 'Hardware', url: 'https://blockstream.com/jade/', experience: ['beginner', 'intermediate'], value: ['small', 'medium'], usage: ['savings', 'occasional'], multisig: 'capable', platform: ['hardware'], note: 'Hardware wallet com recursos de QR e documentação oficial própria.' },
    { name: 'Trezor Safe 3', type: 'Hardware', url: 'https://trezor.io/trezor-safe-3', experience: ['beginner', 'intermediate'], value: ['small', 'medium'], usage: ['savings', 'occasional'], multisig: 'capable', platform: ['hardware'], note: 'Hardware wallet com fluxo guiado pelo aplicativo oficial.' },
    { name: 'BitBox02', type: 'Hardware', url: 'https://bitbox.swiss/bitbox02/', experience: ['beginner', 'intermediate'], value: ['small', 'medium'], usage: ['savings', 'occasional'], multisig: 'capable', platform: ['hardware'], note: 'Hardware wallet com abordagem focada em um processo de configuração guiado.' },
    { name: 'COLDCARD', type: 'Hardware', url: 'https://coldcard.com/', experience: ['intermediate', 'advanced'], value: ['medium', 'large'], usage: ['savings'], multisig: 'native', platform: ['hardware'], note: 'Dispositivo voltado a fluxos mais avançados e ao uso de multisig air-gapped.' },
    { name: 'BlueWallet', type: 'Mobile', url: 'https://bluewallet.io/', experience: ['beginner', 'intermediate'], value: ['small', 'medium'], usage: ['occasional', 'frequent'], multisig: 'capable', platform: ['mobile'], note: 'Carteira mobile com recursos de autocustódia e suporte a carteiras multisig.' },
    { name: 'Phoenix', type: 'Mobile', url: 'https://phoenix.acinq.co/', experience: ['beginner', 'intermediate'], value: ['small'], usage: ['frequent'], multisig: 'none', platform: ['mobile'], note: 'Carteira mobile focada em transações via Lightning; estude limites e modelo de uso antes de utilizá-la.' },
    { name: 'Sparrow Wallet', type: 'Desktop', url: 'https://sparrowwallet.com/', experience: ['advanced'], value: ['medium', 'large'], usage: ['savings', 'occasional'], multisig: 'native', platform: ['desktop'], note: 'Carteira desktop voltada a controle de transações, hardware wallets e configurações multisig.' },
    { name: 'Nunchuk', type: 'Mobile + Desktop', url: 'https://nunchuk.io/', experience: ['intermediate', 'advanced'], value: ['medium', 'large'], usage: ['savings', 'occasional'], multisig: 'native', platform: ['mobile', 'desktop'], note: 'Aplicativo voltado à coordenação de configurações multisig em celular e computador.' }
  ];
  const state = { step: 0, answers: {}, selected: null, locked: false };
  const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function score(wallet) {
    let points = 0;
    const criteria = [];
    const answers = state.answers;
    if (wallet.experience.includes(answers.experience)) { points += 2; criteria.push('seu nível de experiência'); }
    if (wallet.value.includes(answers.value)) { points += 2; criteria.push('a faixa de valor informada'); }
    if (wallet.usage.includes(answers.usage)) { points += 1; criteria.push('a forma de uso pretendida'); }
    if (answers.multisig === 'yes' && wallet.multisig === 'native') { points += 3; criteria.push('seu interesse em multisig'); }
    if (answers.multisig === 'yes' && wallet.multisig === 'capable') { points += 1; }
    if (answers.multisig === 'no' && wallet.multisig !== 'native') { points += 1; criteria.push('sua preferência por começar com simplicidade'); }
    if (wallet.platform.includes(answers.platform)) { points += 2; criteria.push('a plataforma preferida'); }
    return { ...wallet, points, compatibility: Math.min(100, Math.round((points / 10) * 100)), criteria: [...new Set(criteria)] };
  }
  function reason(criteria) {
    if (!criteria.length) return 'Opção complementar que atende parte dos critérios escolhidos.';
    if (criteria.length === 1) return `Aparece por combinar com ${criteria[0]}.`;
    return `Aparece por combinar com ${criteria.slice(0, -1).join(', ')} e ${criteria.at(-1)}.`;
  }
  function renderIntro() {
    app.innerHTML = `<div class="wallet-intro"><span class="wallet-kicker">COMPARADOR DE WALLETS</span><h2>Não existe uma wallet <em>ideal para todos.</em></h2><p>Existe uma combinação entre necessidades, conhecimento, rotina e ferramentas. Este comparador usa somente essas preferências para organizar alternativas de pesquisa — nada é salvo ou enviado.</p><div class="wallet-stats"><span><b>5</b> perguntas</span><span><b>~1 min</b> para responder</span><span><b>0</b> dados pessoais</span></div><button class="wallet-button" id="wallet-start" type="button">Começar comparador <span>→</span></button></div>`;
    document.querySelector('#wallet-start').addEventListener('click', () => { state.step = 0; state.answers = {}; renderQuestion(); });
  }
  function renderQuestion() {
    const question = questions[state.step];
    const optionHtml = question.options.map((option, index) => `<button class="wallet-option${state.selected === index ? ' is-selected' : ''}" type="button" data-choice="${index}"><b>${esc(option.label)}</b><span>${esc(option.sub)}</span></button>`).join('');
    app.innerHTML = `<div class="wallet-question"><div class="wallet-progress"><span>PERGUNTA ${String(state.step + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}</span><b>${question.id.toUpperCase()}</b></div><div class="wallet-track"><i style="width:${((state.step + 1) / questions.length) * 100}%"></i></div><h2>${esc(question.text)}</h2><div class="wallet-options">${optionHtml}</div>${state.step ? '<button class="wallet-back" type="button">← Voltar</button>' : ''}</div>`;
    app.querySelectorAll('[data-choice]').forEach((button) => button.addEventListener('click', () => choose(Number(button.dataset.choice))));
    app.querySelector('.wallet-back')?.addEventListener('click', () => { state.step -= 1; state.selected = null; renderQuestion(); });
  }
  function choose(index) {
    if (state.locked) return;
    state.locked = true;
    state.selected = index;
    renderQuestion();
    window.setTimeout(() => {
      state.answers[questions[state.step].id] = questions[state.step].options[index].value;
      state.selected = null;
      state.locked = false;
      if (state.step < questions.length - 1) { state.step += 1; renderQuestion(); } else renderResults();
    }, 240);
  }
  function renderResults() {
    const matches = wallets.map(score).sort((a, b) => b.points - a.points).slice(0, 3);
    const cards = matches.map((wallet, index) => `<article class="wallet-result${index === 0 ? ' featured' : ''}"><div class="wallet-result-top"><div><span class="wallet-rank">${index === 0 ? 'MAIOR COMPATIBILIDADE' : `ALTERNATIVA ${String(index + 1).padStart(2, '0')}`}</span><h3>${esc(wallet.name)}</h3><span class="wallet-type">${esc(wallet.type)}</span></div><strong class="wallet-score">${wallet.compatibility}%</strong></div><p>${esc(wallet.note)}</p><div class="wallet-reasons">${esc(reason(wallet.criteria))}</div><a class="wallet-docs" href="${wallet.url}" target="_blank" rel="noreferrer">Ver documentação oficial ↗</a></article>`).join('');
    app.innerHTML = `<div class="wallet-results-view"><div class="wallet-result-heading"><div><span class="wallet-kicker">RESULTADO EDUCATIVO</span><h2>Alternativas para <em>pesquisar.</em></h2></div><button type="button" id="wallet-restart">Refazer comparador ↺</button></div><div class="wallet-results">${cards}</div><section class="wallet-protocol-cta"><span>PRÓXIMO PASSO</span><h3>Escolher a carteira é só o <em>começo.</em></h3><p>O Protocolo Seja seu Próprio Banco leva você da geração da seed até o plano de herança, passo a passo — qualquer que seja a carteira escolhida acima.</p><a href="protocolo.html">Quero o Protocolo Soberano <b>→</b></a></section><p class="wallet-note">Compatibilidade é um recurso de organização, não uma recomendação ou garantia. Antes de usar qualquer wallet, valide o site, a assinatura do software quando aplicável e a documentação oficial. Não digite seed phrases, chaves privadas ou códigos de recuperação em sites, formulários ou chats.</p></div>`;
    app.querySelector('#wallet-restart').addEventListener('click', renderIntro);
  }
  document.querySelector('#year').textContent = new Date().getFullYear();
  renderIntro();
})();

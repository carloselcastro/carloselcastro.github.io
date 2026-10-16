'use strict';
const $ = s => document.querySelector(s);
const CFG = window.MONITOR_CONFIG || {};
const PARAMS = new URLSearchParams(location.search);
const ENSAIO = PARAMS.has('ensaio');
const KEY = 'monitor-teste-' + (CFG.versao || 'v1') + (ENSAIO ? '-ensaio' : '');
const TAREFAS = [
  { n: 1, titulo: 'Exigências da AC3', texto: 'Você está fechando a entrega da AC3 da sua equipe e quer ter certeza do que precisa constar no registro do teste. Use o Monitor para descobrir isso e confira de onde veio a informação.' },
  { n: 2, titulo: 'Estudar priorização', texto: 'Você vai estudar para a AP2 e quer praticar priorização de funcionalidades. Use o Monitor para conseguir algo que ajude você a estudar esse tema.' },
  { n: 3, titulo: 'Sua própria dúvida', texto: 'Faça ao Monitor uma pergunta que você realmente tem sobre a disciplina e avalie se a resposta ajudaria você.' }
];
const COLUNAS = ['id', 'codigo', 'enviado_em', 'versao', 'dispositivo', 't1_encontrou', 't1_conferiu_fonte', 'relato_t1', 't2_util', 't3_ajudou', 'facilidade_1a5', 'confianca_1a5', 'dificuldade', 'confianca_porque', 'mudanca', 'outro', 'log_minutos_ate_envio', 'log_n_perguntas', 'log_n_sem_resposta', 'log_n_fontes_abertas', 'log_fontes_abertas', 'log_abriu_materiais', 'log_n_novas_conversas', 'log_perguntas', 'log_intencoes'];

// ---------- estado da sessão (sobrevive a recarregar a página) ----------
function novoCodigo() { const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let c = 'P-'; for (let i = 0; i < 4; i++) c += a[Math.floor(Math.random() * a.length)]; return c; }
function carregar() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.code) return s; } catch { } return null; }
let S = carregar() || { code: novoCodigo(), id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()), started: null, events: [], questions: [], tasksDone: {}, draft: {}, submitted: false, pending: null };
function salvar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { } }
function log(tipo, dados) { S.events.push({ t: new Date().toISOString(), tipo, ...dados }); if (S.events.length > 400) S.events.shift(); salvar(); }

// ---------- navegação ----------
const VIEWS = ['chat', 'library', 'tasks', 'feedback'];
function setView(view) {
  for (const name of VIEWS) $('#' + name + '-view').hidden = name !== view;
  document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  log('tela', { tela: view });
  if (view === 'feedback') { log('abriu_feedback', {}); }
  window.scrollTo(0, 0);
}
document.querySelectorAll('.nav').forEach(b => b.onclick = () => setView(b.dataset.view));
document.querySelectorAll('.go-feedback').forEach(b => b.onclick = () => setView('feedback'));

// ---------- conversa simulada ----------
let sources = [], busy = false, ultimaPergunta = '';
function message(role, text) {
  const article = document.createElement('article'); article.className = 'message ' + role;
  const label = document.createElement('div'); label.className = 'role'; label.textContent = role === 'user' ? 'VOCÊ' : 'MONITOR';
  const body = document.createElement('div'); body.className = 'answer'; body.textContent = text;
  article.append(label, body); $('#messages').append(article); return article;
}
function showSource(source, origem) {
  log('abriu_fonte', { fonte: source.id, origem });
  $('#source-title').textContent = source.id + ' · ' + source.title;
  $('#source-file').textContent = source.file ? 'Arquivo original: ' + source.file : '';
  $('#source-text').textContent = source.quote ? source.quote : 'O trecho completo deste material não está disponível nesta versão do Monitor. Consulte o slide original no ambiente da disciplina.';
  $('#source-text').classList.toggle('quote', !!source.quote);
  $('#source-dialog').showModal();
}
$('#close-source').onclick = () => $('#source-dialog').close();
$('#reset').onclick = () => { if (busy) return; log('nova_conversa', {}); ultimaPergunta = ''; $('#messages').replaceChildren(); message('assistant', 'Conversa nova. Qual dúvida você quer investigar?'); $('#question').value = ''; $('#question').focus(); };
document.querySelectorAll('[data-question]').forEach(b => b.onclick = () => { log('sugestao', { texto: b.dataset.question }); $('#question').value = b.dataset.question; $('#question').focus(); });

const espera = ms => new Promise(r => setTimeout(r, ms));
async function submit() {
  if (busy) return;
  const question = $('#question').value.trim(); if (!question) return;
  busy = true; $('#send').disabled = true; $('#reset').disabled = true;
  message('user', question); $('#question').value = '';
  const card = message('assistant', ''); card.querySelector('.answer').innerHTML = '<span class="typing" aria-label="Consultando os materiais"><i></i><i></i><i></i></span>';
  const result = window.MonitorRespostas.responder(question, sources, ultimaPergunta);
  await espera(Math.min(900 + (result.answer || '').length * 2.2, 2600) + Math.random() * 500);
  card.querySelector('.answer').textContent = result.answer;
  for (const c of result.citations || []) { const b = document.createElement('button'); b.className = 'citation'; b.textContent = c.id + ' · ' + c.title; b.onclick = () => showSource(c, 'resposta'); card.append(b); }
  if (result.limitations) { const limits = document.createElement('div'); limits.className = 'limits'; limits.textContent = 'Limites: ' + result.limitations; card.append(limits); }
  S.questions.push({ t: new Date().toISOString(), q: question.slice(0, 500), intent: result.intent, fallback: result.fallback });
  log('pergunta', { intent: result.intent, fallback: result.fallback });
  if (!result.fallback && result.tipo !== 'conversa') ultimaPergunta = question;
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  busy = false; $('#send').disabled = false; $('#reset').disabled = false; $('#question').focus();
}
$('#chat-form').onsubmit = e => { e.preventDefault(); submit(); };
$('#question').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } };

// ---------- materiais ----------
function renderSources() {
  const q = window.MonitorRespostas.normalizar($('#source-search').value);
  const filtered = sources.filter(s => window.MonitorRespostas.normalizar(s.id + ' ' + s.title).includes(q));
  $('#source-list').replaceChildren();
  for (const source of filtered.slice(0, 60)) { const b = document.createElement('button'); b.className = 'source-item'; b.textContent = source.id + ' · ' + source.title; const span = document.createElement('span'); span.textContent = source.file; b.append(span); b.onclick = () => showSource(source, 'materiais'); $('#source-list').append(b); }
  if (!filtered.length) $('#source-list').textContent = 'Nenhum material encontrado. Tente outra palavra.';
}
let buscaTimer; $('#source-search').oninput = () => { renderSources(); clearTimeout(buscaTimer); buscaTimer = setTimeout(() => log('busca_materiais', { termo: $('#source-search').value.slice(0, 80) }), 900); };

// ---------- tarefas ----------
function renderTasks() {
  $('#task-list').replaceChildren();
  for (const t of TAREFAS) {
    const card = document.createElement('article'); card.className = 'task' + (S.tasksDone[t.n] ? ' done' : '');
    const h = document.createElement('h3'); h.textContent = 'Tarefa ' + t.n + ' · ' + t.titulo;
    const p = document.createElement('p'); p.textContent = t.texto;
    const lab = document.createElement('label'); lab.className = 'task-check';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!S.tasksDone[t.n];
    cb.onchange = () => { S.tasksDone[t.n] = cb.checked; log('tarefa_marcada', { tarefa: t.n, feita: cb.checked }); renderTasks(); };
    lab.append(cb, document.createTextNode(' Terminei esta tarefa'));
    const go = document.createElement('button'); go.className = 'secondary'; go.type = 'button'; go.textContent = 'Ir para o Monitor'; go.onclick = () => setView('chat');
    const row = document.createElement('div'); row.className = 'task-actions'; row.append(lab, go);
    card.append(h, p, row); $('#task-list').append(card);
  }
}

// ---------- feedback ----------
const form = $('#feedback-form');
function lerForm() { const d = {}; for (const el of form.elements) { if (!el.name) continue; if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; } else if (el.type === 'checkbox') d[el.name] = el.checked ? 'sim' : ''; else d[el.name] = el.value.trim(); } return d; }
function preencherForm(d) { for (const el of form.elements) { if (!el.name || !(el.name in d)) continue; if (el.type === 'radio') el.checked = el.value === d[el.name]; else if (el.type === 'checkbox') el.checked = d[el.name] === 'sim'; else el.value = d[el.name]; } }
form.addEventListener('input', () => { S.draft = lerForm(); salvar(); });
function dispositivo() { return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'celular/tablet' : 'computador'; }
function montarPayload(d) {
  const abertas = S.events.filter(e => e.tipo === 'abriu_fonte');
  const inicio = S.started ? new Date(S.started) : null;
  return {
    id: S.id, codigo: S.code, enviado_em: new Date().toISOString(), versao: (CFG.versao || '') + (ENSAIO ? '-ENSAIO' : ''), dispositivo: dispositivo(),
    t1_encontrou: d.t1_encontrou || '', t1_conferiu_fonte: d.t1_conferiu_fonte || '', relato_t1: d.relato_t1 || '', t2_util: d.t2_util || '', t3_ajudou: d.t3_ajudou || '',
    facilidade_1a5: d.facilidade_1a5 ? Number(d.facilidade_1a5) : '', confianca_1a5: d.confianca_1a5 ? Number(d.confianca_1a5) : '', dificuldade: d.dificuldade || '', confianca_porque: d.confianca_porque || '', mudanca: d.mudanca || '', outro: d.outro || '',
    log_minutos_ate_envio: inicio ? Math.round((Date.now() - inicio) / 6000) / 10 : '',
    log_n_perguntas: S.questions.length,
    log_n_sem_resposta: S.questions.filter(q => q.fallback).length,
    log_n_fontes_abertas: abertas.length,
    log_fontes_abertas: abertas.map(e => e.fonte + '(' + e.origem + ')').join('; '),
    log_abriu_materiais: S.events.some(e => e.tipo === 'tela' && e.tela === 'library') ? 'sim' : 'não',
    log_n_novas_conversas: S.events.filter(e => e.tipo === 'nova_conversa').length,
    log_perguntas: S.questions.map((q, i) => (i + 1) + ') ' + q.q).join(' || '),
    log_intencoes: S.questions.map(q => q.intent).join('; '),
    website: d.website || ''
  };
}
function validar(d) {
  const faltas = [];
  for (const [k, nome] of [['t1_encontrou', 'Tarefa 1: encontrou?'], ['t1_conferiu_fonte', 'Tarefa 1: conferiu a fonte?'], ['t2_util', 'Tarefa 2'], ['t3_ajudou', 'Tarefa 3'], ['facilidade_1a5', 'facilidade'], ['confianca_1a5', 'confiança']]) if (!d[k]) faltas.push(nome);
  for (const [k, nome] of [['relato_t1', 'passo a passo da Tarefa 1'], ['dificuldade', 'onde hesitou'], ['confianca_porque', 'confiar ou desconfiar'], ['mudanca', 'o que mudaria']]) if ((d[k] || '').length < 8) faltas.push(nome);
  if (d.consentimento !== 'sim') faltas.push('confirmação de anonimato');
  return faltas;
}
async function enviar(payload) {
  if (!CFG.feedbackUrl) throw Error('sem_endpoint');
  const r = await fetch(CFG.feedbackUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
  const j = await r.json();
  if (!j.ok) throw Error(j.error || 'falha');
  return j;
}
function mostrarConcluido() { form.hidden = true; $('#feedback-fallback').hidden = true; $('#feedback-done').hidden = false; $('#code-done').textContent = S.code; }
function mostrarFallback(msg) { form.hidden = true; $('#feedback-done').hidden = true; $('#feedback-fallback').hidden = false; $('#fallback-status').textContent = msg || ''; }
async function tentarEnvio() {
  const btn = $('#submit-feedback'); btn.disabled = true; btn.textContent = 'Enviando…'; $('#retry-send').disabled = true;
  try { await enviar(S.pending); S.submitted = true; log('feedback_enviado', {}); mostrarConcluido(); }
  catch (e) { log('feedback_falhou', { erro: String(e.message).slice(0, 80) }); mostrarFallback(e.message === 'sem_endpoint' ? 'O envio automático não está ativo nesta versão. Baixe ou copie seu feedback e entregue ao professor.' : 'Falha de conexão. Tente de novo em alguns segundos.'); }
  finally { btn.disabled = false; btn.textContent = 'Enviar feedback'; $('#retry-send').disabled = false; salvar(); }
}
form.onsubmit = e => {
  e.preventDefault();
  const d = lerForm(); const faltas = validar(d);
  if (faltas.length) { $('#form-error').textContent = 'Falta responder: ' + faltas.join(', ') + '.'; return; }
  $('#form-error').textContent = '';
  S.pending = montarPayload(d); salvar(); tentarEnvio();
};
$('#retry-send').onclick = () => { if (S.pending) { S.pending.enviado_em = new Date().toISOString(); tentarEnvio(); } };
const csvCell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
$('#download-feedback').onclick = () => {
  const p = S.pending; if (!p) return;
  const csv = '﻿' + COLUNAS.join(';') + '\n' + COLUNAS.map(c => csvCell(p[c])).join(';') + '\n';
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'feedback-monitor-' + S.code + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  $('#fallback-status').textContent = 'Arquivo baixado: feedback-monitor-' + S.code + '.csv';
};
$('#copy-feedback').onclick = async () => {
  const p = S.pending; if (!p) return;
  const txt = COLUNAS.map(c => c + ': ' + (p[c] ?? '')).join('\n');
  try { await navigator.clipboard.writeText(txt); $('#fallback-status').textContent = 'Copiado. Cole onde o professor indicar.'; }
  catch { $('#source-title').textContent = 'Selecione e copie o texto'; $('#source-file').textContent = ''; $('#source-text').textContent = txt; $('#source-dialog').showModal(); }
};

// ---------- painel do professor (?painel) ----------
async function painel() {
  document.body.innerHTML = '<div class="painel"><img src="ibmec.png" alt="IBMEC"><p class="eyebrow">PAINEL DO PROFESSOR · TESTE EM SALA</p><div id="p-count" class="p-count">–</div><p class="p-label">feedbacks recebidos</p><p id="p-info" class="small"></p></div>';
  if (!CFG.feedbackUrl) { $('#p-info').textContent = 'feedbackUrl vazio em config.js: o envio automático não está ativo.'; return; }
  async function atualizar() {
    try { const r = await fetch(CFG.feedbackUrl + '?acao=contar&t=' + Date.now()); const j = await r.json(); $('#p-count').textContent = j.count; $('#p-info').textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR') + (j.ensaio ? ' · ' + j.ensaio + ' de ensaio (fora da contagem)' : '') + (j.last ? ' · último às ' + new Date(j.last).toLocaleTimeString('pt-BR') : ''); }
    catch { $('#p-info').textContent = 'Sem conexão com a planilha. Nova tentativa em 10 s.'; }
  }
  atualizar(); setInterval(atualizar, 10000);
}

// ---------- início ----------
async function init() {
  if (PARAMS.has('painel')) return painel();
  $('#participant-chip').hidden = false; $('#participant-chip').textContent = (ENSAIO ? 'ENSAIO · ' : '') + 'Código ' + S.code;
  $('#code-inline').textContent = S.code; $('#code-start').textContent = S.code;
  renderTasks(); preencherForm(S.draft || {});
  if (S.submitted) mostrarConcluido(); else if (S.pending) mostrarFallback('Você já tentou enviar. Tente de novo ou baixe o arquivo.');
  try { sources = await fetch('sources.json').then(r => r.json()); renderSources(); } catch { $('#source-list').textContent = 'Não foi possível carregar a lista de materiais.'; }
  if (!S.started) {
    $('#start-dialog').showModal();
    $('#start-test').onclick = () => { S.started = new Date().toISOString(); log('inicio', { dispositivo: dispositivo() }); $('#start-dialog').close(); setView('tasks'); };
    $('#start-dialog').addEventListener('cancel', e => e.preventDefault());
  }
}
init();

// Global State & Data
let chartJurosInstance = null;
let chartEstudosInstance = null;
let chartOrcamentoInstance = null;

// Lista inicial de disciplinas
let disciplinas = [
  { id: 1, nome: 'Matemática e Suas Tecnologias', peso: 4, dificuldade: 4 },
  { id: 2, nome: 'Redação', peso: 5, dificuldade: 3 },
  { id: 3, nome: 'Ciências da Natureza', peso: 3, dificuldade: 4 },
  { id: 4, nome: 'Linguagens e Códigos', peso: 2, dificuldade: 2 }
];

// Lista inicial de metas
let metas = [
  { id: 1, titulo: 'Reserva de Emergência', categoria: 'Financeiro', valorTotal: 5000, valorAtual: 2100, prazoMeses: 10 },
  { id: 2, titulo: 'Curso / Certificação Técnica', categoria: 'Estudos', valorTotal: 1200, valorAtual: 800, prazoMeses: 4 }
];

// --- NAVEGAÇÃO ENTRE ABAS ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');

  // Atualizar botões de navegação
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
    btn.classList.add('text-slate-400');
  });

  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
    activeBtn.classList.remove('text-slate-400');
  }

  // Fechar menu mobile se aberto
  document.getElementById('mobile-menu').classList.add('hidden');

  // Triggers de renderização específica
  if (tabId === 'juros') calcularJuros();
  if (tabId === 'estudos') renderTabelaDisciplinas();
  if (tabId === 'orcamento') calcularOrcamento();
  if (tabId === 'metas') renderMetas();
  if (tabId === 'dashboard') renderDashboardGoals();
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

// --- MÓDULO 1: JUROS COMPOSTOS ---
function calcularJuros() {
  const C = parseFloat(document.getElementById('juros-inicial').value) || 0;
  const A = parseFloat(document.getElementById('juros-mensal').value) || 0;
  const taxaAnual = parseFloat(document.getElementById('juros-taxa').value) || 0;
  const anos = parseInt(document.getElementById('juros-anos').value) || 1;

  const i = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1; // taxa mensal equivalente
  const totalMeses = anos * 12;

  let labels = [];
  let dataInvestido = [];
  let dataTotal = [];

  let montanteAtual = C;
  let investidoAcumulado = C;

  for (let m = 0; m <= totalMeses; m++) {
    if (m > 0) {
      montanteAtual = montanteAtual * (1 + i) + A;
      investidoAcumulado += A;
    }

    if (m % 12 === 0 || m === totalMeses) {
      labels.push(`Ano ${Math.floor(m / 12)}`);
      dataInvestido.push(Math.round(investidoAcumulado));
      dataTotal.push(Math.round(montanteAtual));
    }
  }

  const jurosGanhos = montanteAtual - investidoAcumulado;

  // Atualizar UI
  document.getElementById('res-juros-total').innerText = formatCurrency(montanteAtual);
  document.getElementById('res-juros-investido').innerText = formatCurrency(investidoAcumulado);
  document.getElementById('res-juros-ganhos').innerText = formatCurrency(jurosGanhos);

  // Renderizar Gráfico
  renderChartJuros(labels, dataInvestido, dataTotal);
}

function renderChartJuros(labels, dataInvestido, dataTotal) {
  const ctx = document.getElementById('chartJuros').getContext('2d');
  if (chartJurosInstance) chartJurosInstance.destroy();

  chartJurosInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Acumulado (Com Juros)',
          data: dataTotal,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Total Investido (Do Bolso)',
          data: dataInvestido,
          borderColor: '#6366f1',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } }
      }
    }
  });
}

// --- MÓDULO 2: PLANO DE ESTUDOS (PESOS MATEMÁTICOS) ---
function adicionarDisciplina() {
  const nomeInput = document.getElementById('estudo-nome');
  const pesoInput = document.getElementById('estudo-peso');
  const difInput = document.getElementById('estudo-dif');

  if (!nomeInput.value.trim()) return;

  disciplinas.push({
    id: Date.now(),
    nome: nomeInput.value.trim(),
    peso: parseFloat(pesoInput.value) || 1,
    dificuldade: parseFloat(difInput.value) || 1
  });

  nomeInput.value = '';
  renderTabelaDisciplinas();
}

function removerDisciplina(id) {
  disciplinas = disciplinas.filter(d => d.id !== id);
  renderTabelaDisciplinas();
}

function renderTabelaDisciplinas() {
  const tbody = document.getElementById('tabela-disciplinas');
  tbody.innerHTML = '';

  disciplinas.forEach(d => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/40 border-b border-slate-800';
    tr.innerHTML = `
      <td class="py-3 px-2 font-medium text-white">${d.nome}</td>
      <td class="py-3 px-2 text-center">${d.peso}</td>
      <td class="py-3 px-2 text-center">${d.dificuldade}</td>
      <td class="py-3 px-2 text-center font-semibold text-indigo-400">${d.peso * d.dificuldade}</td>
      <td class="py-3 px-2 text-right font-bold text-emerald-400" id="horas-disc-${d.id}">-</td>
      <td class="py-3 px-2 text-right">
        <button onclick="removerDisciplina(${d.id})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  calcularEstudos();
}

function calcularEstudos() {
  const horasTotais = parseFloat(document.getElementById('estudo-horas-totais').value) || 0;
  
  // Soma dos índices (Peso * Dificuldade)
  const somaIndices = disciplinas.reduce((acc, d) => acc + (d.peso * d.dificuldade), 0);

  if (somaIndices === 0) return;

  let labels = [];
  let dataHoras = [];

  disciplinas.forEach(d => {
    const indice = d.peso * d.dificuldade;
    const horasProporcionais = (indice / somaIndices) * horasTotais;
    
    const cell = document.getElementById(`horas-disc-${d.id}`);
    if (cell) cell.innerText = `${horasProporcionais.toFixed(1)}h`;

    labels.push(d.nome);
    dataHoras.push(parseFloat(horasProporcionais.toFixed(1)));
  });

  renderChartEstudos(labels, dataHoras);
}

function renderChartEstudos(labels, dataHoras) {
  const ctx = document.getElementById('chartEstudos').getContext('2d');
  if (chartEstudosInstance) chartEstudosInstance.destroy();

  chartEstudosInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: dataHoras,
        backgroundColor: [
          '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#94a3b8' } }
      }
    }
  });
}

// --- MÓDULO 3: REGRA 50/30/20 ---
function calcularOrcamento() {
  const renda = parseFloat(document.getElementById('orcamento-renda').value) || 0;

  const v50 = renda * 0.50;
  const v30 = renda * 0.30;
  const v20 = renda * 0.20;

  document.getElementById('orc-50-valor').innerText = formatCurrency(v50);
  document.getElementById('orc-30-valor').innerText = formatCurrency(v30);
  document.getElementById('orc-20-valor').innerText = formatCurrency(v20);

  renderChartOrcamento([v50, v30, v20]);
}

function renderChartOrcamento(dataArr) {
  const ctx = document.getElementById('chartOrcamento').getContext('2d');
  if (chartOrcamentoInstance) chartOrcamentoInstance.destroy();

  chartOrcamentoInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['50% Necessidades', '30% Desejos Pessoais', '20% Futuro / Investimentos'],
      datasets: [{
        data: dataArr,
        backgroundColor: ['#f59e0b', '#a855f7', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8' } }
      }
    }
  });
}

// --- MÓDULO 4: METAS DE VIDA ---
function abrirModalMeta() {
  document.getElementById('modal-meta').classList.remove('hidden');
  document.getElementById('modal-meta').classList.add('flex');
}

function fecharModalMeta() {
  document.getElementById('modal-meta').classList.add('hidden');
  document.getElementById('modal-meta').classList.remove('flex');
}

function salvarMeta() {
  const titulo = document.getElementById('meta-titulo').value.trim();
  const categoria = document.getElementById('meta-categoria').value;
  const valorTotal = parseFloat(document.getElementById('meta-valor-total').value) || 0;
  const valorAtual = parseFloat(document.getElementById('meta-valor-atual').value) || 0;
  const prazoMeses = parseInt(document.getElementById('meta-prazo').value) || 1;

  if (!titulo) return;

  metas.push({
    id: Date.now(),
    titulo,
    categoria,
    valorTotal,
    valorAtual,
    prazoMeses
  });

  fecharModalMeta();
  renderMetas();
  renderDashboardGoals();
}

function removerMeta(id) {
  metas = metas.filter(m => m.id !== id);
  renderMetas();
  renderDashboardGoals();
}

function renderMetas() {
  const container = document.getElementById('lista-metas-cards');
  container.innerHTML = '';

  metas.forEach(m => {
    const pct = Math.min(100, Math.round((m.valorAtual / m.valorTotal) * 100));
    const restante = Math.max(0, m.valorTotal - m.valorAtual);
    const aporteMensalNecessario = restante / m.prazoMeses;

    const card = document.createElement('div');
    card.className = 'bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 relative flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-3">
          <div>
            <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${m.categoria}</span>
            <h3 class="font-outfit text-xl font-bold text-white mt-1">${m.titulo}</h3>
          </div>
          <button onclick="removerMeta(${m.id})" class="text-slate-500 hover:text-rose-400 text-sm"><i class="fa-solid fa-trash"></i></button>
        </div>

        <div class="space-y-2 my-4">
          <div class="flex justify-between text-xs text-slate-400">
            <span>Progresso Acumulado</span>
            <span class="font-bold text-white">${pct}%</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
            <div class="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full" style="width: ${pct}%"></div>
          </div>
          <div class="flex justify-between text-xs pt-1">
            <span class="text-slate-400">Salvo: <strong class="text-slate-200">${formatCurrency(m.valorAtual)}</strong></span>
            <span class="text-slate-400">Meta: <strong class="text-slate-200">${formatCurrency(m.valorTotal)}</strong></span>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-700/50 bg-slate-900/40 -mx-6 -mb-6 p-4 rounded-b-2xl flex justify-between items-center text-xs">
        <div>
          <span class="text-slate-400 block">Esforço Matemático Estimado:</span>
          <span class="font-bold text-emerald-400 text-sm">${formatCurrency(aporteMensalNecessario)} / mês</span>
        </div>
        <span class="text-slate-400"><i class="fa-regular fa-clock mr-1"></i> ${m.prazoMeses} meses</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderDashboardGoals() {
  const container = document.getElementById('dashboard-goals-list');
  if (!container) return;
  container.innerHTML = '';

  metas.slice(0, 3).forEach(m => {
    const pct = Math.min(100, Math.round((m.valorAtual / m.valorTotal) * 100));
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/40';
    div.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">${pct}%</div>
        <div>
          <h4 class="text-sm font-semibold text-white">${m.titulo}</h4>
          <span class="text-[11px] text-slate-400">${formatCurrency(m.valorAtual)} / ${formatCurrency(m.valorTotal)}</span>
        </div>
      </div>
      <span class="text-xs text-indigo-400 font-medium">${m.prazoMeses} meses restantes</span>
    `;
    container.appendChild(div);
  });
}

// Auxiliar de formatação de moeda
function formatCurrency(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicialização da Aplicação
window.addEventListener('DOMContentLoaded', () => {
  renderDashboardGoals();
});
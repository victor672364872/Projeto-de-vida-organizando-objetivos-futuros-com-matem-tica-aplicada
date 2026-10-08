// Dados Iniciais / Armazenamento Local
let bills = JSON.parse(localStorage.getItem('vkay_bills')) || [
  { id: '1', name: 'Conta de Água (Sanepar)', category: 'Agua', amount: 85.50, dueDate: '2026-10-15', status: 'pendente' },
  { id: '2', name: 'Energia Elétrica (Copel)', category: 'Luz', amount: 210.00, dueDate: '2026-10-20', status: 'pendente' },
  { id: '3', name: 'Internet Fibra', category: 'Internet', amount: 119.90, dueDate: '2026-10-10', status: 'pago' }
];

let categoryChart = null;

// Inicialização ao carregar página
document.addEventListener('DOMContentLoaded', () => {
  renderBills();
  updateDashboard();
  initChart();
});

function saveToLocalStorage() {
  localStorage.setItem('vkay_bills', JSON.stringify(bills));
}

// Troca de Abas
function switchTab(tabName) {
  const tabs = ['dashboard', 'contas', 'projetos'];
  tabs.forEach(t => {
    document.getElementById(`tab-${t}`).classList.add('hidden');
    const navBtn = document.getElementById(`nav-${t}`);
    if (navBtn) {
      navBtn.classList.remove('bg-vkay-600', 'text-white', 'shadow-lg', 'shadow-vkay-600/40');
      navBtn.classList.add('text-vkay-400');
    }
  });

  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
  const activeNav = document.getElementById(`nav-${tabName}`);
  if (activeNav) {
    activeNav.classList.add('bg-vkay-600', 'text-white', 'shadow-lg', 'shadow-vkay-600/40');
    activeNav.classList.remove('text-vkay-400');
  }

  if (tabName === 'dashboard') {
    updateDashboard();
  }
}

// Renderização da Tabela de Contas
function renderBills() {
  const tbody = document.getElementById('bills-table-body');
  const emptyMsg = document.getElementById('empty-bills-msg');
  const search = document.getElementById('filter-search').value.toLowerCase();
  const categoryFilter = document.getElementById('filter-category').value;
  const statusFilter = document.getElementById('filter-status').value;

  const filtered = bills.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search);
    const matchesCat = categoryFilter === 'ALL' || b.category === categoryFilter;
    
    let currentStatus = b.status;
    if (b.status === 'pendente' && isOverdue(b.dueDate)) {
      currentStatus = 'atrasado';
    }

    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  } else {
    emptyMsg.classList.add('hidden');
  }

  filtered.forEach(bill => {
    const isLate = bill.status === 'pendente' && isOverdue(bill.dueDate);
    const displayStatus = isLate ? 'atrasado' : bill.status;

    let badgeClass = 'badge-pendente';
    let badgeText = 'Pendente';
    if (displayStatus === 'pago') { badgeClass = 'badge-pago'; badgeText = 'Pago'; }
    if (displayStatus === 'atrasado') { badgeClass = 'badge-atrasado'; badgeText = 'Atrasado'; }

    const categoryIcons = {
      'Agua': 'fa-droplet text-blue-400',
      'Luz': 'fa-bolt text-amber-400',
      'Internet': 'fa-wifi text-indigo-400',
      'Moradia': 'fa-house text-emerald-400',
      'Mercado': 'fa-cart-shopping text-purple-400',
      'Outros': 'fa-receipt text-slate-400'
    };

    const icon = categoryIcons[bill.category] || categoryIcons['Outros'];

    const tr = document.createElement('tr');
    tr.className = "hover:bg-vkay-800/30";
    tr.innerHTML = `
      <td class="py-4 px-6">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}">
          ${badgeText}
        </span>
      </td>
      <td class="py-4 px-6 font-medium text-white flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-vkay-950 border border-vkay-800 flex items-center justify-center">
          <i class="fa-solid ${icon}"></i>
        </div>
        <span>${bill.name}</span>
      </td>
      <td class="py-4 px-6 text-slate-300 text-xs">${bill.category}</td>
      <td class="py-4 px-6 text-slate-300 text-xs">${formatDate(bill.dueDate)}</td>
      <td class="py-4 px-6 font-semibold text-white">R$ ${parseFloat(bill.amount).toFixed(2)}</td>
      <td class="py-4 px-6 text-right space-x-2">
        <button onclick="toggleBillStatus('${bill.id}')" title="Mudar Status" class="p-2 rounded-lg bg-vkay-800/50 hover:bg-vkay-700 text-slate-200 transition">
          <i class="fa-solid ${bill.status === 'pago' ? 'fa-rotate-left' : 'fa-check'}"></i>
        </button>
        <button onclick="deleteBill('${bill.id}')" title="Excluir" class="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Funções do Modal
function openBillModal() {
  document.getElementById('bill-form').reset();
  document.getElementById('bill-id').value = '';
  document.getElementById('modal-title').innerText = 'Cadastrar Nova Conta';
  document.getElementById('modal-bill').classList.remove('hidden');
}

function closeBillModal() {
  document.getElementById('modal-bill').classList.add('hidden');
}

function handleSaveBill(e) {
  e.preventDefault();
  const id = document.getElementById('bill-id').value || Date.now().toString();
  const name = document.getElementById('bill-name').value;
  const category = document.getElementById('bill-category').value;
  const amount = parseFloat(document.getElementById('bill-amount').value);
  const dueDate = document.getElementById('bill-duedate').value;
  const status = document.getElementById('bill-status').value;

  const existingIndex = bills.findIndex(b => b.id === id);
  if (existingIndex > -1) {
    bills[existingIndex] = { id, name, category, amount, dueDate, status };
  } else {
    bills.push({ id, name, category, amount, dueDate, status });
  }

  saveToLocalStorage();
  renderBills();
  updateDashboard();
  closeBillModal();
}

function toggleBillStatus(id) {
  const bill = bills.find(b => b.id === id);
  if (bill) {
    bill.status = bill.status === 'pago' ? 'pendente' : 'pago';
    saveToLocalStorage();
    renderBills();
    updateDashboard();
  }
}

function deleteBill(id) {
  if (confirm('Tem certeza que deseja remover esta conta?')) {
    bills = bills.filter(b => b.id !== id);
    saveToLocalStorage();
    renderBills();
    updateDashboard();
  }
}

// Atualização de Dashboard e Cálculos
function updateDashboard() {
  let total = 0, pago = 0, pendente = 0, atrasado = 0;
  let countPago = 0, countPendente = 0, countAtrasado = 0;

  bills.forEach(b => {
    const val = parseFloat(b.amount);
    total += val;

    if (b.status === 'pago') {
      pago += val;
      countPago++;
    } else if (isOverdue(b.dueDate)) {
      atrasado += val;
      countAtrasado++;
    } else {
      pendente += val;
      countPendente++;
    }
  });

  document.getElementById('dash-total').innerText = `R$ ${total.toFixed(2)}`;
  document.getElementById('dash-count').innerText = `${bills.length} contas cadastradas`;

  document.getElementById('dash-pago').innerText = `R$ ${pago.toFixed(2)}`;
  document.getElementById('dash-count-pago').innerText = `${countPago} pagas`;

  document.getElementById('dash-pendente').innerText = `R$ ${pendente.toFixed(2)}`;
  document.getElementById('dash-count-pendente').innerText = `${countPendente} pendentes`;

  document.getElementById('dash-atrasado').innerText = `R$ ${atrasado.toFixed(2)}`;
  document.getElementById('dash-count-atrasado').innerText = `${countAtrasado} atrasadas`;

  renderUpcomingBills();
  updateChart();
}

function renderUpcomingBills() {
  const container = document.getElementById('upcoming-bills-list');
  const pending = bills
    .filter(b => b.status === 'pendente')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  if (pending.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-500">Todas as contas cadastradas estão em dia!</p>`;
    return;
  }

  container.innerHTML = pending.map(b => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-vkay-950/60 border border-vkay-800/60">
      <div>
        <p class="text-sm font-semibold text-white">${b.name}</p>
        <p class="text-xs text-slate-400">Vence em: ${formatDate(b.dueDate)}</p>
      </div>
      <span class="text-sm font-bold text-amber-400">R$ ${parseFloat(b.amount).toFixed(2)}</span>
    </div>
  `).join('');
}

// Chart.js
function initChart() {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: getChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 } }
        }
      }
    }
  });
}

function updateChart() {
  if (categoryChart) {
    categoryChart.data = getChartData();
    categoryChart.update();
  }
}

function getChartData() {
  const categories = ['Agua', 'Luz', 'Internet', 'Moradia', 'Mercado', 'Outros'];
  const totals = categories.map(cat => {
    return bills
      .filter(b => b.category === cat)
      .reduce((acc, b) => acc + parseFloat(b.amount), 0);
  });

  return {
    labels: ['Água', 'Luz', 'Internet', 'Moradia', 'Mercado', 'Outros'],
    datasets: [{
      data: totals,
      backgroundColor: ['#60a5fa', '#fbbf24', '#818cf8', '#34d399', '#c084fc', '#94a3b8'],
      borderWidth: 0
    }]
  };
}

// Helpers
function isOverdue(dateStr) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(dateStr + 'T00:00:00');
  return due < today;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
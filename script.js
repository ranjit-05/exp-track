document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    document.getElementById('date').valueAsDate = now;

    const financeApp = new FinanceDashboard();
    financeApp.init();
});

class FinanceDashboard {
    constructor() {
        this.transactions = [];
        this.categories = [
            { id: 1,  name: 'Salary',        type: 'income',  color: '#48BB78', icon: 'fa-money-check-alt' },
            { id: 2,  name: 'Freelance',      type: 'income',  color: '#4299E1', icon: 'fa-laptop-code' },
            { id: 3,  name: 'Investments',    type: 'income',  color: '#9F7AEA', icon: 'fa-chart-line' },
            { id: 4,  name: 'Food',           type: 'expense', color: '#ED8936', icon: 'fa-utensils' },
            { id: 5,  name: 'Transportation', type: 'expense', color: '#4299E1', icon: 'fa-car' },
            { id: 6,  name: 'Entertainment',  type: 'expense', color: '#9F7AEA', icon: 'fa-film' },
            { id: 7,  name: 'Healthcare',     type: 'expense', color: '#F56565', icon: 'fa-heartbeat' },
            { id: 8,  name: 'Shopping',       type: 'expense', color: '#ED64A6', icon: 'fa-shopping-bag' },
            { id: 9,  name: 'Bills',          type: 'expense', color: '#ECC94B', icon: 'fa-file-invoice' },
            { id: 10, name: 'Other',          type: 'expense', color: '#718096', icon: 'fa-ellipsis-h' }
        ];
        this.currentType  = 'income';
        this.incomeTotal  = 0;
        this.expenseTotal = 0;
        this.netBalance   = 0;
        this.expenseChart = null;
        this.healthMeter  = null;
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderCategoriesDropdown();
        this.renderTransactions();
        this.renderCategoryBreakdown();
        this.calculateSummary();
        this.initCharts();
        this.updateUI();
    }

    loadData() {
        const savedTransactions = localStorage.getItem('financeTransactions');
        const savedCategories   = localStorage.getItem('financeCategories');
        this.transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        if (savedCategories) this.categories = JSON.parse(savedCategories);
    }

    saveData() {
        localStorage.setItem('financeTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('financeCategories',   JSON.stringify(this.categories));
    }

    setupEventListeners() {
        document.getElementById('type-income').addEventListener('click', (e) => {
            e.preventDefault();
            this.setTransactionType('income');
        });
        document.getElementById('type-expense').addEventListener('click', (e) => {
            e.preventDefault();
            this.setTransactionType('expense');
        });
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        document.getElementById('add-category-btn').addEventListener('click', () => {
            const newCatName = prompt('Enter new category name:');
            if (newCatName && newCatName.trim() !== '') this.addNewCategory(newCatName.trim());
        });
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.resetForm());
        document.getElementById('reset-data').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Reset all data? This cannot be undone.')) {
                localStorage.clear();
                location.reload();
            }
        });
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportToCSV());
    }

    addNewCategory(name) {
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase() && c.type === this.currentType)) {
            alert('Category already exists!');
            return;
        }
        this.categories.push({ id: Date.now(), name, type: this.currentType, color: '#718096', icon: 'fa-tag' });
        this.saveData();
        this.renderCategoriesDropdown();
        document.getElementById('category').value = name;
    }

    setTransactionType(type) {
        this.currentType = type;
        document.getElementById('type-income').classList.toggle('active',  type === 'income');
        document.getElementById('type-expense').classList.toggle('active', type === 'expense');
        this.renderCategoriesDropdown();
    }

    renderCategoriesDropdown() {
        const sel = document.getElementById('category');
        const cur = sel.value;
        sel.innerHTML = '<option value="">Select a category</option>';
        const filtered = this.categories.filter(c => c.type === this.currentType);
        filtered.forEach(cat => {
            const o = document.createElement('option');
            o.value = cat.name;
            o.textContent = cat.name;
            sel.appendChild(o);
        });
        if (filtered.some(c => c.name === cur)) sel.value = cur;
    }

    handleFormSubmit() {
        const editId      = document.getElementById('edit-id').value;
        const description = document.getElementById('description').value;
        const amount      = parseFloat(document.getElementById('amount').value);
        const category    = document.getElementById('category').value;
        const date        = document.getElementById('date').value;

        if (!description || !amount || !category || !date) {
            alert('Please fill in all fields');
            return;
        }

        if (editId) {
            const i = this.transactions.findIndex(t => t.id == editId);
            if (i !== -1) {
                this.transactions[i] = { ...this.transactions[i], type: this.currentType, description, amount, category, date };
            }
        } else {
            this.transactions.push({ id: Date.now(), type: this.currentType, description, amount, category, date });
        }

        this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.saveData();
        this.resetForm();
        this.refreshAll();
    }

    resetForm() {
        document.getElementById('transaction-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('form-title').textContent = 'Add Transaction';
        document.getElementById('submit-btn').innerHTML = '<i class="fas fa-check"></i> Add Transaction';
        document.getElementById('cancel-edit-btn').style.display = 'none';
        document.getElementById('date').valueAsDate = new Date();
    }

    startEditing(id) {
        const t = this.transactions.find(t => t.id === id);
        if (!t) return;
        this.setTransactionType(t.type);
        document.getElementById('edit-id').value        = t.id;
        document.getElementById('description').value    = t.description;
        document.getElementById('amount').value         = t.amount;
        document.getElementById('date').value           = t.date;
        document.getElementById('category').value       = t.category;
        document.getElementById('form-title').textContent         = 'Edit Transaction';
        document.getElementById('submit-btn').innerHTML           = '<i class="fas fa-save"></i> Update';
        document.getElementById('cancel-edit-btn').style.display  = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveData();
        this.refreshAll();
    }

    refreshAll() {
        this.renderTransactions();
        this.calculateSummary();
        this.renderCategoryBreakdown();
        this.updateCharts();
        this.updateUI();
    }

    renderTransactions() {
        const list = document.getElementById('transactions-list');
        if (this.transactions.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>No transactions yet.</p></div>';
            return;
        }
        list.innerHTML = this.transactions.slice(0, 10).map(t => {
            const cat   = this.categories.find(c => c.name === t.category) || {};
            const color = cat.color || '#718096';
            const icon  = cat.icon  || 'fa-tag';
            const formattedDate = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            const safeDesc = t.description.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `
                <div class="transaction-item ${t.type}" data-id="${t.id}">
                    <div class="transaction-info">
                        <div class="transaction-description">${safeDesc}</div>
                        <div class="transaction-meta">
                            <span class="transaction-category" style="color:${color}">
                                <i class="fas ${icon}"></i> ${t.category}
                            </span>
                            <span class="transaction-date">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${t.type === 'income' ? 'positive' : 'negative'}">
                        ${t.type === 'income' ? '+' : '-'}&#8377;${t.amount.toFixed(2)}
                    </div>
                    <div class="transaction-actions">
                        <button class="action-btn edit-btn"   title="Edit">  <i class="fas fa-pen"></i>   </button>
                        <button class="action-btn delete-btn" title="Delete"><i class="fas fa-trash"></i> </button>
                    </div>
                </div>`;
        }).join('');

        list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.transaction-item').dataset.id);
                if (confirm('Delete this transaction?')) this.deleteTransaction(id);
            });
        });
        list.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.transaction-item').dataset.id);
                this.startEditing(id);
            });
        });
    }

    calculateSummary() {
        this.incomeTotal  = this.transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
        this.expenseTotal = this.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        this.netBalance   = this.incomeTotal - this.expenseTotal;

        const today      = new Date();
        const daysPassed = Math.max(1, Math.ceil((today - new Date(today.getFullYear(), today.getMonth(), 1)) / 86400000));
        const monthExp   = this.transactions
            .filter(t => {
                const d = new Date(t.date);
                return t.type === 'expense' && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
            })
            .reduce((s, t) => s + t.amount, 0);

        const savingsRate    = this.incomeTotal > 0 ? (this.netBalance / this.incomeTotal * 100) : 0;
        const largestExpense = this.transactions.filter(t => t.type === 'expense').reduce((m, t) => Math.max(m, t.amount), 0);

        document.getElementById('total-income').textContent      = `\u20B9${this.incomeTotal.toFixed(2)}`;
        document.getElementById('total-expenses').textContent    = `\u20B9${this.expenseTotal.toFixed(2)}`;
        document.getElementById('net-balance').textContent       = `\u20B9${this.netBalance.toFixed(2)}`;
        document.getElementById('daily-average').textContent     = `\u20B9${(monthExp / daysPassed).toFixed(2)}`;
        document.getElementById('savings-rate').textContent      = `${savingsRate.toFixed(0)}%`;
        document.getElementById('transaction-count').textContent = this.transactions.length;
        document.getElementById('largest-expense').textContent   = `\u20B9${largestExpense.toFixed(2)}`;

        this.updateHealthScore(savingsRate);
    }

    updateHealthScore(savingsRate) {
        let score = 50;
        if      (savingsRate > 20)  score += 30;
        else if (savingsRate > 10)  score += 20;
        else if (savingsRate > 0)   score += 10;
        else if (savingsRate < -10) score -= 20;
        else if (savingsRate < 0)   score -= 10;
        score = Math.max(0, Math.min(100, score));

        document.getElementById('health-score').textContent = Math.round(score);
        const texts = [
            [80, 'Excellent - Strong financial health'],
            [60, 'Good - Spending less than earned'],
            [40, 'Fair - Room for improvement'],
            [0,  'Needs attention - Expenses high']
        ];
        document.getElementById('health-text').textContent = texts.find(([t]) => score >= t)[1];

        if (this.healthMeter) {
            this.healthMeter.data.datasets[0].data = [score, 100 - score];
            this.healthMeter.update();
        }
    }

    renderCategoryBreakdown() {
        const container = document.getElementById('categories-container');
        const totals = {};
        this.categories.filter(c => c.type === 'expense').forEach(cat => {
            const total = this.transactions
                .filter(t => t.type === 'expense' && t.category === cat.name)
                .reduce((s, t) => s + t.amount, 0);
            if (total > 0) totals[cat.name] = { total, color: cat.color };
        });
        const sorted = Object.entries(totals).sort((a, b) => b[1].total - a[1].total);
        container.innerHTML = sorted.length === 0
            ? '<div class="empty-state"><p>No expense data yet.</p></div>'
            : sorted.map(([name, d]) => `
                <div class="category-badge">
                    <div class="category-left">
                        <div class="category-color" style="background-color:${d.color}"></div>
                        <div class="category-name">${name}</div>
                    </div>
                    <div class="category-amount">\u20B9${d.total.toFixed(2)}</div>
                </div>`).join('');
    }

    initCharts() {
        const expCtx = document.getElementById('expense-chart').getContext('2d');
        this.expenseChart = new Chart(expCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{ data: [], backgroundColor: [], borderWidth: 2, borderColor: '#ffffff', hoverOffset: 8 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });

        const hCtx = document.getElementById('health-meter').getContext('2d');
        this.healthMeter = new Chart(hCtx, {
            type: 'doughnut',
            data: {
                datasets: [{ data: [50, 50], backgroundColor: ['#48BB78', '#E2E8F0'], borderWidth: 0, circumference: 180, rotation: 270 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
        this.updateCharts();
    }

    updateCharts() {
        if (!this.expenseChart) return;
        const data = [], labels = [], colors = [];
        this.categories.filter(c => c.type === 'expense').forEach(cat => {
            const total = this.transactions
                .filter(t => t.type === 'expense' && t.category === cat.name)
                .reduce((s, t) => s + t.amount, 0);
            if (total > 0) { data.push(total); labels.push(cat.name); colors.push(cat.color); }
        });
        this.expenseChart.data.labels = labels;
        this.expenseChart.data.datasets[0].data = data;
        this.expenseChart.data.datasets[0].backgroundColor = colors;
        this.expenseChart.update();
    }

    updateUI() {
        document.querySelector('.balance-card').style.background = this.netBalance >= 0
            ? 'linear-gradient(135deg, var(--primary), #2D3748)'
            : 'linear-gradient(135deg, #F56565, #FC8181)';
    }

    exportToCSV() {
        if (this.transactions.length === 0) { alert('No transactions to export.'); return; }
        const headers = ['Date', 'Type', 'Description', 'Category', 'Amount (Rs)'];
        const rows = [...this.transactions]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(t => [
                t.date,
                t.type.charAt(0).toUpperCase() + t.type.slice(1),
                `"${t.description.replace(/"/g, '""')}"`,
                `"${t.category.replace(/"/g, '""')}"`,
                t.amount.toFixed(2)
            ]);
        const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        const now  = new Date();
        a.href     = url;
        a.download = `expensify-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

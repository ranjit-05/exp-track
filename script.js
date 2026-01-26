document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    // Use proper locale for header date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    document.getElementById('date').valueAsDate = now;
    
    const financeApp = new FinanceDashboard();
    financeApp.init();
});

class FinanceDashboard {
    constructor() {
        this.transactions = [];
        // Default categories are okay to keep, but transactions will be empty
        this.categories = [
            { id: 1, name: 'Salary', type: 'income', color: '#48BB78', icon: 'fa-money-check-alt' },
            { id: 2, name: 'Freelance', type: 'income', color: '#4299E1', icon: 'fa-laptop-code' },
            { id: 3, name: 'Investments', type: 'income', color: '#9F7AEA', icon: 'fa-chart-line' },
            { id: 4, name: 'Food', type: 'expense', color: '#ED8936', icon: 'fa-utensils' },
            { id: 5, name: 'Transportation', type: 'expense', color: '#4299E1', icon: 'fa-car' },
            { id: 6, name: 'Entertainment', type: 'expense', color: '#9F7AEA', icon: 'fa-film' },
            { id: 7, name: 'Healthcare', type: 'expense', color: '#F56565', icon: 'fa-heartbeat' },
            { id: 8, name: 'Shopping', type: 'expense', color: '#ED64A6', icon: 'fa-shopping-bag' },
            { id: 9, name: 'Bills', type: 'expense', color: '#ECC94B', icon: 'fa-file-invoice' },
            { id: 10, name: 'Other', type: 'expense', color: '#718096', icon: 'fa-ellipsis-h' }
        ];
       
        this.currentType = 'income';
        this.incomeTotal = 0;
        this.expenseTotal = 0;
        this.netBalance = 0;
        this.expenseChart = null;
        this.healthMeter = null;
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
        const savedCategories = localStorage.getItem('financeCategories');
       
        if (savedTransactions) {
            this.transactions = JSON.parse(savedTransactions);
        } else {
            // FIX: Start with empty array instead of loading sample data
            this.transactions = [];
        }
       
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }
    }
   
    saveData() {
        localStorage.setItem('financeTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('financeCategories', JSON.stringify(this.categories));
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
            const newCatName = prompt("Enter new category name:");
            if (newCatName && newCatName.trim() !== "") {
                this.addNewCategory(newCatName.trim());
            }
        });

        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            this.resetForm();
        });
       
        document.getElementById('reset-data').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Reset all data? This cannot be undone.')) {
                localStorage.clear();
                // We reload to clear the memory
                location.reload(); 
            }
        });
    }

    addNewCategory(name) {
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase() && c.type === this.currentType)) {
            alert('Category already exists!');
            return;
        }

        const newCategory = { 
            id: Date.now(), 
            name: name, 
            type: this.currentType, 
            color: '#718096', 
            icon: 'fa-tag' 
        };
        
        this.categories.push(newCategory);
        this.saveData();
        this.renderCategoriesDropdown();
        document.getElementById('category').value = name;
    }
   
    setTransactionType(type) {
        this.currentType = type;
        document.getElementById('type-income').classList.toggle('active', type === 'income');
        document.getElementById('type-expense').classList.toggle('active', type === 'expense');
        this.renderCategoriesDropdown();
    }
   
    renderCategoriesDropdown() {
        const categorySelect = document.getElementById('category');
        const currentVal = categorySelect.value; 
        categorySelect.innerHTML = '<option value="">Select a category</option>';
       
        const filteredCategories = this.categories.filter(cat => cat.type === this.currentType);
        filteredCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        if (filteredCategories.some(c => c.name === currentVal)) {
            categorySelect.value = currentVal;
        }
    }
   
    handleFormSubmit() {
        const editId = document.getElementById('edit-id').value;
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
       
        if (!description || !amount || !category || !date) {
            alert('Please fill in all fields');
            return;
        }

        if (editId) {
            // UPDATE EXISTING
            const index = this.transactions.findIndex(t => t.id == editId);
            if (index !== -1) {
                this.transactions[index] = {
                    ...this.transactions[index],
                    type: this.currentType,
                    description,
                    amount,
                    category,
                    date
                };
            }
        } else {
            // CREATE NEW
            const newTransaction = {
                id: Date.now(),
                type: this.currentType,
                description,
                amount,
                category,
                date
            };
            this.transactions.push(newTransaction);
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
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        this.setTransactionType(transaction.type);
        document.getElementById('edit-id').value = transaction.id;
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('date').value = transaction.date;
        document.getElementById('category').value = transaction.category;

        document.getElementById('form-title').textContent = 'Edit Transaction';
        document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Update';
        document.getElementById('cancel-edit-btn').style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
   
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
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
        const transactionsList = document.getElementById('transactions-list');
       
        if (this.transactions.length === 0) {
            transactionsList.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>No transactions yet.</p></div>';
            return;
        }
       
        const recentTransactions = this.transactions.slice(0, 10);
       
        transactionsList.innerHTML = recentTransactions.map(transaction => {
            const category = this.categories.find(cat => cat.name === transaction.category) || {};
            const categoryColor = category.color || '#718096';
            const icon = category.icon || 'fa-tag';
            const formattedDate = new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            
            const safeDesc = transaction.description.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            return `
                <div class="transaction-item ${transaction.type}" data-id="${transaction.id}">
                    <div class="transaction-info">
                        <div class="transaction-description">${safeDesc}</div>
                        <div class="transaction-meta">
                            <span class="transaction-category" style="color: ${categoryColor}">
                                <i class="fas ${icon}"></i> ${transaction.category}
                            </span>
                            <span class="transaction-date">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}">
                        ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                    </div>
                    <div class="transaction-actions">
                        <button class="action-btn edit-btn" title="Edit">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
       
        transactionsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.transaction-item').dataset.id);
                if (confirm('Delete this transaction?')) this.deleteTransaction(id);
            });
        });

        transactionsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.transaction-item').dataset.id);
                this.startEditing(id);
            });
        });
    }
   
    calculateSummary() {
        this.incomeTotal = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        this.expenseTotal = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        this.netBalance = this.incomeTotal - this.expenseTotal;
       
        // Daily Average Logic
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const timeDiff = today - firstDayOfMonth;
        const daysPassed = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
        
        const currentMonthExpenses = this.transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && 
                       tDate.getMonth() === today.getMonth() && 
                       tDate.getFullYear() === today.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const dailyAverage = currentMonthExpenses / daysPassed;

        const savingsRate = this.incomeTotal > 0 ? ((this.incomeTotal - this.expenseTotal) / this.incomeTotal * 100) : 0;
        const largestExpense = this.transactions.filter(t => t.type === 'expense').reduce((max, t) => Math.max(max, t.amount), 0);
       
        document.getElementById('total-income').textContent = `₹${this.incomeTotal.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `₹${this.expenseTotal.toFixed(2)}`;
        document.getElementById('net-balance').textContent = `₹${this.netBalance.toFixed(2)}`;
        document.getElementById('daily-average').textContent = `₹${dailyAverage.toFixed(2)}`;
        document.getElementById('savings-rate').textContent = `${savingsRate.toFixed(0)}%`;
        document.getElementById('transaction-count').textContent = this.transactions.length;
        document.getElementById('largest-expense').textContent = `₹${largestExpense.toFixed(2)}`;
       
        this.updateHealthScore(savingsRate);
    }
   
    updateHealthScore(savingsRate) {
        let healthScore = 50;
        if (savingsRate > 20) healthScore += 30;
        else if (savingsRate > 10) healthScore += 20;
        else if (savingsRate > 0) healthScore += 10;
        else if (savingsRate < -10) healthScore -= 20;
        else if (savingsRate < 0) healthScore -= 10;
       
        healthScore = Math.max(0, Math.min(100, healthScore));
       
        document.getElementById('health-score').textContent = Math.round(healthScore);
        
        let healthText = '';
        if (healthScore >= 80) healthText = 'Excellent - Strong financial health';
        else if (healthScore >= 60) healthText = 'Good - Spending less than earned';
        else if (healthScore >= 40) healthText = 'Fair - Room for improvement';
        else healthText = 'Needs attention - Expenses high';
        document.getElementById('health-text').textContent = healthText;
       
        if (this.healthMeter) {
            this.healthMeter.data.datasets[0].data = [healthScore, 100 - healthScore];
            this.healthMeter.update();
        }
    }
   
    renderCategoryBreakdown() {
        const categoriesContainer = document.getElementById('categories-container');
        const categoryTotals = {};
       
        this.categories.forEach(category => {
            if (category.type === 'expense') {
                const total = this.transactions
                    .filter(t => t.type === 'expense' && t.category === category.name)
                    .reduce((sum, t) => sum + t.amount, 0);
               
                if (total > 0) {
                    categoryTotals[category.name] = { total: total, color: category.color };
                }
            }
        });
       
        const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1].total - a[1].total);
       
        if (sortedCategories.length === 0) {
            categoriesContainer.innerHTML = '<div class="empty-state"><p>No expense data yet.</p></div>';
            return;
        }
       
        categoriesContainer.innerHTML = sortedCategories.map(([name, data]) => {
            return `
                <div class="category-badge">
                    <div class="category-left">
                        <div class="category-color" style="background-color: ${data.color}"></div>
                        <div class="category-name">${name}</div>
                    </div>
                    <div class="category-amount">₹${data.total.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }
   
    initCharts() {
        const expenseCtx = document.getElementById('expense-chart').getContext('2d');
        this.expenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
       
        const healthCtx = document.getElementById('health-meter').getContext('2d');
        this.healthMeter = new Chart(healthCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [50, 50],
                    backgroundColor: ['#48BB78', '#E2E8F0'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
        this.updateCharts();
    }
   
    updateCharts() {
        if (!this.expenseChart) return;
       
        const expenseCategories = this.categories.filter(cat => cat.type === 'expense');
        const expenseData = [];
        const expenseLabels = [];
        const expenseColors = [];

        expenseCategories.forEach(category => {
            const total = this.transactions
                .filter(t => t.type === 'expense' && t.category === category.name)
                .reduce((sum, t) => sum + t.amount, 0);
            
            if (total > 0) {
                expenseData.push(total);
                expenseLabels.push(category.name);
                expenseColors.push(category.color);
            }
        });
       
        this.expenseChart.data.labels = expenseLabels;
        this.expenseChart.data.datasets[0].data = expenseData;
        this.expenseChart.data.datasets[0].backgroundColor = expenseColors;
        this.expenseChart.update();
    }
   
    updateUI() {
        const balanceCard = document.querySelector('.balance-card');
        const balanceAmount = document.getElementById('net-balance');
        if (this.netBalance >= 0) {
            balanceCard.style.background = 'linear-gradient(135deg, var(--primary), #2D3748)';
        } else {
            balanceCard.style.background = 'linear-gradient(135deg, #F56565, #FC8181)';
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginCard = document.querySelector('.login-card');
    const signupCard = document.getElementById('signupCard');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const addExpenseForm = document.getElementById('addExpenseForm');
    console.log('addExpenseForm element:', addExpenseForm);
    const expenseForm = document.getElementById('expenseForm');
    const navItems = document.querySelectorAll('.nav-item');
    const transactionList = document.querySelector('.transaction-list');
    const mainContent = document.querySelector('.main-content');
    const expenseList = document.getElementById('expenseList');
    const totalAmount = document.getElementById('totalAmount');
    const dailyLimitElement = document.getElementById('dailyLimit');
    const logoutBtn = document.getElementById('logoutBtn');

    // Store original dashboard content for restoration
    const originalMainContent = mainContent.innerHTML;

    // Sample transactions data
    let transactions = [
        { name: 'Grocery Shopping', amount: 85.50, date: '2024-03-15', category: 'Food' },
        { name: 'Netflix Subscription', amount: 15.99, date: '2024-03-14', category: 'Entertainment' },
        { name: 'Gas Bill', amount: 45.00, date: '2024-03-13', category: 'Utilities' }
    ];

    // Daily limit state with localStorage persistence
    let dailyLimit = parseFloat(localStorage.getItem('dailyLimit')) || 100;

    // Calculate total expenses
    function calculateTotalExpenses() {
        return transactions.reduce((total, transaction) => total + transaction.amount, 0);
    }

    // Update dashboard summary
    function updateDashboardSummary() {
        const totalExpenses = calculateTotalExpenses();
        const todayTotal = getTodayTotal();
        const todayRemaining = dailyLimit - todayTotal;

        // Update today's expenses
        const todaysExpensesElement = document.getElementById('todaysExpenses');
        if (todaysExpensesElement) {
            todaysExpensesElement.textContent = `$${todayTotal.toFixed(2)}`;
        }
        // Update total expenses
        const totalExpensesElement = document.getElementById('totalExpenses');
        if (totalExpensesElement) {
            totalExpensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
        }
        // Update daily limit and remaining
        const dailyLimitElementCurrent = document.getElementById('dailyLimit');
        const remainingBudgetElementCurrent = document.getElementById('remainingBudget');
        if (dailyLimitElementCurrent) {
            dailyLimitElementCurrent.textContent = `$${dailyLimit.toFixed(2)}`;
        }
        if (remainingBudgetElementCurrent) {
            remainingBudgetElementCurrent.textContent = `Remaining: $${todayRemaining.toFixed(2)}`;
        }

        checkExpenseLimit(totalExpenses);
        bindChangeLimitBtn();
    }

    // Check if expenses are approaching the limit
    function checkExpenseLimit(totalExpenses) {
        const dailyAverage = totalExpenses / 30;
        const limitPercentage = (dailyAverage / dailyLimit) * 100;

        if (limitPercentage >= 80) {
            showAlert(`Warning: You've used ${limitPercentage.toFixed(1)}% of your daily limit!`);
        }
    }

    // Show alert notification
    function showAlert(message) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = 'alert warning';
        alert.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(alert);

        // Remove alert after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Show success notification
    function showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert success';
        alert.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    // Login Form Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Just show dashboard on login (no real auth)
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
    });

    // Sign Up Form Handler
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Just show login form after signup (no real auth)
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
    });

    // Toggle between login and signup
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
    });

    // Add Expense Button Handler
    addExpenseBtn.addEventListener('click', () => {
        addExpenseForm.style.display = 'flex';
    });

    // Close Add Expense Form when clicking outside
    addExpenseForm.addEventListener('click', (e) => {
        if (e.target === addExpenseForm) {
            addExpenseForm.style.display = 'none';
        }
    });

    // Expense Form Handler
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = expenseForm.querySelector('input[type="text"]').value;
        const amount = parseFloat(expenseForm.querySelector('input[type="number"]').value);
        const date = expenseForm.querySelector('input[type="date"]').value;

        // Add new transaction
        const newTransaction = { 
            name, 
            amount, 
            date,
            category: 'Other' // You can add category selection later
        };
        transactions.unshift(newTransaction);
        filterTransactions();
        updateDashboardSummary();

        // Reset and close form
        expenseForm.reset();
        addExpenseForm.style.display = 'none';
    });

    // Navigation Handler
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Handle navigation
            const section = item.querySelector('span').textContent.toLowerCase();
            switch(section) {
                case 'home':
                    restoreDashboard();
                    addExpenseForm.style.display = 'none';
                    break;
                case 'add':
                    // Always show dashboard and open add form
                    restoreDashboard();
                    addExpenseForm.style.display = 'flex';
                    break;
                case 'stats':
                    showStats();
                    addExpenseForm.style.display = 'none';
                    break;
                case 'profile':
                    showProfile();
                    addExpenseForm.style.display = 'none';
                    break;
            }
        });
    });

    // Restore dashboard content
    function restoreDashboard() {
        mainContent.innerHTML = originalMainContent;
        // Re-attach transactionList reference and reload transactions
        const newTransactionList = mainContent.querySelector('.transaction-list');
        if (newTransactionList) {
            transactionList.innerHTML = '';
            newTransactionList.innerHTML = '';
            loadTransactions(newTransactionList);
        }
        updateDashboardSummary();
        bindChangeLimitBtn();
    }

    // Show Statistics
    function showStats() {
        mainContent.innerHTML = `
            <div class="stats-container">
                <h2>Expense Statistics</h2>
                <div class="stats-grid">
                    <div class="card">
                        <h3>Monthly Overview</h3>
                        <div class="chart-placeholder">
                            <p>Monthly chart will be displayed here</p>
                        </div>
                    </div>
                    <div class="card">
                        <h3>Category Breakdown</h3>
                        <div class="category-list">
                            ${generateCategoryBreakdown()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate Category Breakdown
    function generateCategoryBreakdown() {
        const categories = {};
        transactions.forEach(transaction => {
            categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
        });

        return Object.entries(categories)
            .map(([category, amount]) => `
                <div class="category-item">
                    <span>${category}</span>
                    <span>$${amount.toFixed(2)}</span>
                </div>
            `).join('');
    }

    // Show Profile
    function showProfile() {
        mainContent.innerHTML = `
            <div class="profile-container">
                <div class="card">
                    <h2>User Profile</h2>
                    <div class="profile-info">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="profile-details">
                            <h3>John Doe</h3>
                            <p>john.doe@example.com</p>
                        </div>
                    </div>
                    <div class="profile-settings">
                        <button class="btn-primary">Edit Profile</button>
                        <button class="btn-primary">Change Password</button>
                    </div>
                </div>
            </div>
        `;
    }

    // --- Filter Bar Logic ---
    const searchInput = document.getElementById('searchInput');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const categoryFilter = document.getElementById('categoryFilter');
    const minAmountInput = document.getElementById('minAmount');
    const maxAmountInput = document.getElementById('maxAmount');

    function filterTransactions() {
        let filtered = transactions.slice();
        const search = searchInput.value.trim().toLowerCase();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const category = categoryFilter.value;
        const minAmount = parseFloat(minAmountInput.value);
        const maxAmount = parseFloat(maxAmountInput.value);

        if (search) {
            filtered = filtered.filter(t => t.name.toLowerCase().includes(search));
        }
        if (startDate) {
            filtered = filtered.filter(t => t.date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(t => t.date <= endDate);
        }
        if (category) {
            filtered = filtered.filter(t => t.category === category);
        }
        if (!isNaN(minAmount)) {
            filtered = filtered.filter(t => t.amount >= minAmount);
        }
        if (!isNaN(maxAmount)) {
            filtered = filtered.filter(t => t.amount <= maxAmount);
        }
        loadTransactions(undefined, filtered);
    }

    // Attach filter listeners
    [searchInput, startDateInput, endDateInput, categoryFilter, minAmountInput, maxAmountInput].forEach(input => {
        input.addEventListener('input', filterTransactions);
    });

    // Map categories to Font Awesome icons
    const categoryIcons = {
        'Food': 'fa-utensils',
        'Groceries': 'fa-cart-shopping',
        'Gas': 'fa-gas-pump',
        'Entertainment': 'fa-film',
        'Utilities': 'fa-lightbulb',
        'Subscriptions': 'fa-mobile-alt',
        'Rent': 'fa-home',
        'Work': 'fa-briefcase',
        'Health': 'fa-heartbeat',
        'Other': 'fa-receipt'
    };

    // Update loadTransactions to use icons and new layout
    function loadTransactions(targetList, data) {
        const list = targetList || transactionList;
        list.innerHTML = '';
        (data || transactions).forEach(transaction => {
            const iconClass = categoryIcons[transaction.category] || categoryIcons['Other'];
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <i class="fa-regular ${iconClass}"></i>
                    <div>
                    <h4>${transaction.name}</h4>
                    <span class="transaction-date">${formatDate(transaction.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount">$${transaction.amount.toFixed(2)}</div>
            `;
            list.appendChild(transactionElement);
        });
    }

    // Initial load
    loadTransactions();

    // Format Date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Add some CSS for new components
    const style = document.createElement('style');
    style.textContent = `
        .transaction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            background: var(--bg-color);
            border-radius: 15px;
            box-shadow: 4px 4px 8px var(--shadow-dark),
                        -4px -4px 8px var(--shadow-light);
        }

        .transaction-info h4 {
            margin: 0;
            color: var(--text-color);
        }

        .transaction-date {
            font-size: 12px;
            color: var(--accent-color);
        }

        .transaction-amount {
            font-weight: 600;
            color: var(--accent-color);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .chart-placeholder {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-color);
            border-radius: 15px;
            box-shadow: inset 4px 4px 8px var(--shadow-dark),
                        inset -4px -4px 8px var(--shadow-light);
        }

        .category-list {
            margin-top: 15px;
        }

        .category-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            margin-bottom: 10px;
            background: var(--bg-color);
            border-radius: 10px;
            box-shadow: 2px 2px 4px var(--shadow-dark),
                        -2px -2px 4px var(--shadow-light);
        }

        .profile-container {
            max-width: 600px;
            margin: 0 auto;
        }

        .profile-info {
            display: flex;
            align-items: center;
            margin: 20px 0;
        }

        .profile-avatar {
            font-size: 64px;
            margin-right: 20px;
            color: var(--accent-color);
        }

        .profile-details h3 {
            margin: 0;
            color: var(--text-color);
        }

        .profile-details p {
            margin: 5px 0 0;
            color: var(--accent-color);
        }

        .profile-settings {
            display: grid;
            gap: 10px;
            margin-top: 20px;
        }
    `;
    document.head.appendChild(style);

    // Extract the modal logic to a function
    function openChangeLimitModal() {
        const modal = document.createElement('div');
        modal.className = 'limit-modal';
        modal.innerHTML = `
            <div class="limit-modal-content">
                <h2>Change Daily Limit</h2>
                <form id="limitForm">
                    <div class="input-group">
                        <label for="newLimit">Daily Spending Limit ($)</label>
                        <input type="number" 
                               id="newLimit" 
                               value="${dailyLimit}" 
                               min="1" 
                               step="0.01" 
                               required
                               placeholder="Enter new daily limit">
                    </div>
                    <div class="btn-group">
                        <button type="submit" class="btn-primary">Save Changes</button>
                        <button type="button" class="btn-secondary" id="cancelLimit">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Focus on input
        const newLimitInput = document.getElementById('newLimit');
        newLimitInput.focus();
        newLimitInput.select();

        // Handle form submission
        const limitForm = document.getElementById('limitForm');
        limitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newLimit = parseFloat(newLimitInput.value);
            
            // Validate input
            if (isNaN(newLimit) || newLimit <= 0) {
                showAlert('Please enter a valid amount greater than 0');
                return;
            }

            // Check if the new limit is significantly different
            const difference = Math.abs(newLimit - dailyLimit);
            const percentageChange = (difference / dailyLimit) * 100;

            if (percentageChange > 50) {
                if (!confirm(`Are you sure you want to change the limit by ${percentageChange.toFixed(1)}%?`)) {
                    return;
                }
            }

            // Update limit
            dailyLimit = newLimit;
            localStorage.setItem('dailyLimit', dailyLimit);
            
            // Update UI
            updateDashboardSummary();
            showSuccess('Daily limit updated successfully!');
            modal.remove();

            // Check if new limit triggers any warnings
            const totalExpenses = calculateTotalExpenses();
            checkExpenseLimit(totalExpenses);
        });

        // Handle cancel button
        document.getElementById('cancelLimit').addEventListener('click', () => {
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function closeModal(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeModal);
            }
        });
    }

    // Load User Data
    async function loadUserData(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.dailyLimit) {
                    dailyLimitElement.textContent = `Daily Limit: $${userData.dailyLimit}`;
                }
            }
            loadExpenses(userId);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Load Expenses
    async function loadExpenses(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const expensesSnapshot = await db.collection('expenses')
                .where('userId', '==', userId)
                .where('date', '>=', today)
                .orderBy('date', 'desc')
                .get();

            let total = 0;
            expenseList.innerHTML = '';

            expensesSnapshot.forEach((doc) => {
                const expense = doc.data();
                total += expense.amount;

                const expenseElement = document.createElement('div');
                expenseElement.className = 'expense-item';
                expenseElement.innerHTML = `
                    <div class="expense-info">
                        <h3>${expense.description}</h3>
                        <p>${expense.category}</p>
                    </div>
                    <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                `;
                expenseList.appendChild(expenseElement);
            });

            totalAmount.textContent = `Total: $${total.toFixed(2)}`;
            checkDailyLimit(total);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    // Check Daily Limit
    async function checkDailyLimit(total) {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.dailyLimit && total >= userData.dailyLimit * 0.8) {
                    alert('Warning: You are approaching your daily spending limit!');
                }
            }
        } catch (error) {
            console.error('Error checking daily limit:', error);
        }
    }

    // Show/Hide Functions
    function showLoginForm() {
        loginForm.style.display = 'flex';
        dashboard.style.display = 'none';
    }

    function showDashboard() {
        loginForm.style.display = 'none';
        dashboard.style.display = 'block';
    }

    // --- Daily Limit Exceeded Alert Logic ---
    function showDailyLimitExceededAlert() {
        // Remove any existing alert
        const existing = document.getElementById('dailyLimitAlert');
        if (existing) existing.remove();

        const alert = document.createElement('div');
        alert.id = 'dailyLimitAlert';
        alert.className = 'alert-banner';
        alert.innerHTML = `
            <span><i class="fas fa-exclamation-circle"></i> Daily limit exceeded!</span>
            <button class="close-alert" aria-label="Close">&times;</button>
        `;
        document.body.prepend(alert);

        // Close on button click
        alert.querySelector('.close-alert').onclick = () => alert.remove();
        // Auto-remove after 5 seconds
        setTimeout(() => { if (alert.parentNode) alert.remove(); }, 5000);
    }

    function getTodayTotal() {
        const today = new Date().toISOString().slice(0, 10);
        return transactions
            .filter(t => t.date === today)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    function checkIfLimitExceeded() {
        if (getTodayTotal() > dailyLimit) {
            showDailyLimitExceededAlert();
        }
    }

    // Call after adding expense or changing limit
    const originalExpenseFormHandler = expenseForm.onsubmit;
    expenseForm.addEventListener('submit', (e) => {
        setTimeout(checkIfLimitExceeded, 0);
    });
    // Also check after changing limit
    const originalOpenChangeLimitModal = openChangeLimitModal;
    openChangeLimitModal = function() {
        originalOpenChangeLimitModal.apply(this, arguments);
        // Patch the modal's save handler to check limit after change
        setTimeout(() => {
            const limitForm = document.getElementById('limitForm');
            if (limitForm) {
                limitForm.addEventListener('submit', () => {
                    setTimeout(checkIfLimitExceeded, 0);
                });
            }
        }, 100);
    };
    // Initial check on load
    checkIfLimitExceeded();

    // --- Dark Mode Toggle Logic ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn.querySelector('i');
    function setTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark');
    themeToggleBtn.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        setTheme(isDark);
    });

    // --- Show/Hide Password Logic for Login ---
    const loginPassword = document.getElementById('loginPassword');
    const loginEye = document.getElementById('loginEye');
    if (loginEye && loginPassword) {
        loginEye.addEventListener('click', () => {
            const isPwd = loginPassword.type === 'password';
            loginPassword.type = isPwd ? 'text' : 'password';
            loginEye.querySelector('i').className = isPwd ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }
    // --- Show/Hide Password Logic for Signup ---
    const signupPassword = document.getElementById('signupPassword');
    const signupEye = document.getElementById('signupEye');
    if (signupEye && signupPassword) {
        signupEye.addEventListener('click', () => {
            const isPwd = signupPassword.type === 'password';
            signupPassword.type = isPwd ? 'text' : 'password';
            signupEye.querySelector('i').className = isPwd ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }
    // --- Animated Placeholder for Inputs ---
    document.querySelectorAll('.input-group input').forEach(input => {
        function updatePlaceholderClass() {
            if (input.value) {
                input.classList.add('has-content');
            } else {
                input.classList.remove('has-content');
            }
        }
        input.addEventListener('focus', updatePlaceholderClass);
        input.addEventListener('blur', updatePlaceholderClass);
        input.addEventListener('input', updatePlaceholderClass);
        // Initial state
        updatePlaceholderClass();
    });
    // --- Dark Mode Toggle for Login/Signup ---
    function setThemeLogin(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        const icons = document.querySelectorAll('.theme-toggle-btn i');
        icons.forEach(icon => icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    const savedThemeLogin = localStorage.getItem('theme');
    setThemeLogin(savedThemeLogin === 'dark');
    const themeBtnLogin = document.getElementById('themeToggleBtnLogin');
    if (themeBtnLogin) themeBtnLogin.addEventListener('click', () => setThemeLogin(!document.body.classList.contains('dark-mode')));
    const themeBtnSignup = document.getElementById('themeToggleBtnSignup');
    if (themeBtnSignup) themeBtnSignup.addEventListener('click', () => setThemeLogin(!document.body.classList.contains('dark-mode')));

    // Ensure Change Limit button always works
    function bindChangeLimitBtn() {
        const btn = document.getElementById('changeLimitBtn');
        if (btn) {
            btn.onclick = openChangeLimitModal;
        }
    }
    // Initial bind
    bindChangeLimitBtn();

    // NEW: Show spinner
    function showSpinner() {
        document.getElementById('globalSpinner').style.display = 'flex';
    }
    function hideSpinner() {
        document.getElementById('globalSpinner').style.display = 'none';
    }

    // NEW: Show empty state if no transactions
    function updateEmptyState(filteredList) {
        const emptyState = document.getElementById('emptyState');
        const list = filteredList !== undefined ? filteredList : transactions;
        if (list.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }
    }

    // NEW: Edit/delete actions for transactions
    function handleEdit(index) {
        showAlert('Edit feature coming soon!');
    }
    function handleDelete(index) {
        // Confirmation modal using limit-modal styles
        const modal = document.createElement('div');
        modal.className = 'limit-modal';
        modal.innerHTML = `
            <div class="limit-modal-content">
                <h2>Delete Transaction</h2>
                <p>Are you sure you want to delete this transaction?</p>
                <div class="btn-group">
                    <button class="btn-primary" id="confirmDelete">Delete</button>
                    <button class="btn-secondary" id="cancelDelete">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('confirmDelete').onclick = () => {
            transactions.splice(index, 1);
            filterTransactions();
            updateDashboardSummary();
            modal.remove();
            showSuccess('Transaction deleted successfully!');
        };
        document.getElementById('cancelDelete').onclick = () => modal.remove();
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.addEventListener('keydown', function closeModal(e) {
            if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', closeModal); }
        });
    }

    // Update loadTransactions to add edit/delete buttons and handle empty state
    function loadTransactions(targetList, data) {
        const list = targetList || transactionList;
        list.innerHTML = '';
        const txs = data || transactions;
        updateEmptyState(txs);
        txs.forEach((transaction, idx) => {
            const iconClass = categoryIcons[transaction.category] || categoryIcons['Other'];
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <i class="fa-regular ${iconClass}"></i>
                    <div>
                        <h4>${transaction.name}</h4>
                        <span class="transaction-date">${formatDate(transaction.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount">$${transaction.amount.toFixed(2)}</div>
                <div class="transaction-actions">
                    <button class="action-btn" aria-label="Edit" title="Edit" tabindex="0"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-btn" aria-label="Delete" title="Delete" tabindex="0"><i class="fas fa-trash"></i></button>
                </div>
            `;
            // NEW: Add event listeners for edit/delete
            const actions = transactionElement.querySelectorAll('.action-btn');
            actions[0].onclick = () => handleEdit(idx);
            actions[1].onclick = () => handleDelete(idx);
            list.appendChild(transactionElement);
        });
    }

    // Update filterTransactions to handle empty state
    function filterTransactions() {
        let filtered = transactions.slice();
        const search = searchInput.value.trim().toLowerCase();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const category = categoryFilter.value;
        const minAmount = parseFloat(minAmountInput.value);
        const maxAmount = parseFloat(maxAmountInput.value);

        if (search) {
            filtered = filtered.filter(t => t.name.toLowerCase().includes(search));
        }
        if (startDate) {
            filtered = filtered.filter(t => t.date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(t => t.date <= endDate);
        }
        if (category) {
            filtered = filtered.filter(t => t.category === category);
        }
        if (!isNaN(minAmount)) {
            filtered = filtered.filter(t => t.amount >= minAmount);
        }
        if (!isNaN(maxAmount)) {
            filtered = filtered.filter(t => t.amount <= maxAmount);
        }
        loadTransactions(undefined, filtered);
        updateEmptyState(filtered);
    }

    // NEW: Form validation helpers
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function isValidPassword(pwd) {
        return typeof pwd === 'string' && pwd.length >= 8;
    }

    // Expense Form Handler (with validation and spinner)
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = expenseForm.querySelector('input[type="text"]').value;
        const amount = parseFloat(expenseForm.querySelector('input[type="number"]').value);
        const date = expenseForm.querySelector('input[type="date"]').value;
        // NEW: Validate amount
        if (isNaN(amount) || amount <= 0) {
            showAlert('Amount must be greater than 0');
            return;
        }
        showSpinner(); // NEW
        // Add new transaction
        const newTransaction = { 
            name, 
            amount, 
            date,
            category: 'Other' // You can add category selection later
        };
        await new Promise(res => setTimeout(res, 600)); // Simulate loading
        transactions.unshift(newTransaction);
        filterTransactions();
        updateDashboardSummary();
        hideSpinner(); // NEW
        // Reset and close form
        expenseForm.reset();
        addExpenseForm.style.display = 'none';
    });

    // Login Form Handler (with validation and spinner)
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address');
            return;
        }
        if (!isValidPassword(password)) {
            showAlert('Password must be at least 8 characters');
            return;
        }
        showSpinner(); // NEW
        await new Promise(res => setTimeout(res, 600)); // Simulate loading
        // Just show dashboard on login (no real auth)
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        hideSpinner(); // NEW
    });

    // Sign Up Form Handler (with validation and spinner)
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address');
            return;
        }
        if (!isValidPassword(password)) {
            showAlert('Password must be at least 8 characters');
            return;
        }
        showSpinner(); // NEW
        await new Promise(res => setTimeout(res, 600)); // Simulate loading
        // Just show login form after signup (no real auth)
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
        hideSpinner(); // NEW
    });
}); 
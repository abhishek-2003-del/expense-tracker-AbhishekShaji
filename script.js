let transactions = [];
let pieChart = null;

window.onload = function() {
    let savedData = localStorage.getItem('myTransactions');
    if (savedData !== null) {
        transactions = JSON.parse(savedData);
    }
    document.getElementById('date').valueAsDate = new Date();
    updateAll();
};

function saveData() {
    localStorage.setItem('myTransactions', JSON.stringify(transactions));
}

function handleFormSubmit(event) {
    event.preventDefault(); 
    let editId = document.getElementById('edit-id').value;
    let type = document.getElementById('type').value;
    let amount = parseFloat(document.getElementById('amount').value);
    let category = document.getElementById('category').value;
    let date = document.getElementById('date').value;
    let description = document.getElementById('description').value;

    if (amount <= 0 || isNaN(amount)) {
        alert('Please enter a valid amount greater than 0');
        return;
    }
    if (editId === "") {
        let newTransaction = {
            id: Date.now().toString(),
            type: type,
            amount: amount,
            category: category,
            date: date,
            description: description
        };
        transactions.push(newTransaction);
    } else {
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].id === editId) {
                transactions[i].type = type;
                transactions[i].amount = amount;
                transactions[i].category = category;
                transactions[i].date = date;
                transactions[i].description = description;
                break;
            }
        }
        document.getElementById('form-title').innerText = "Add New Transaction";
        document.getElementById('edit-id').value = "";
    }
    saveData();
    updateAll();
    document.getElementById('transaction-form').reset();
    document.getElementById('date').valueAsDate = new Date();
}

function renderTable(dataToDisplay) {
    let tbody = document.getElementById('transaction-table-body');
    tbody.innerHTML = "";

    if (dataToDisplay.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-400">No transactions found.</td></tr>`;
        return;
    }

    for (let i = 0; i < dataToDisplay.length; i++) {
        let t = dataToDisplay[i];
        let colorClass = t.type === 'income' ? 'text-green-600' : 'text-red-600';
        let sign = t.type === 'income' ? '+' : '-';

        let row = document.createElement('tr');
        row.className = "border-b hover:bg-gray-50";
        row.innerHTML = `
            <td class="p-3">${t.date}</td>
            <td class="p-3">${t.description}</td>
            <td class="p-3"><span class="bg-gray-200 px-2 py-1 rounded text-xs">${t.category}</span></td>
            <td class="p-3 font-bold ${colorClass}">${t.amount.toFixed(2)}</td>
            <td class="p-3 text-center">
                <button onclick="editTransaction('${t.id}')" class="text-blue-500 mr-2 font-semibold hover:underline">Edit</button>
                <button onclick="deleteTransaction('${t.id}')" class="text-red-500 font-semibold hover:underline">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    }
}
function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'income') {
            totalIncome += transactions[i].amount;
        } else {
            totalExpense += transactions[i].amount;
        }
    }

    let balance = totalIncome - totalExpense;

    document.getElementById('balance').innerText =  balance.toFixed(2);
    document.getElementById('income').innerText =  totalIncome.toFixed(2);
    document.getElementById('expense').innerText =  totalExpense.toFixed(2);
}

function deleteTransaction(id) {
    let newList = [];
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id !== id) {
            newList.push(transactions[i]);
        }
    }
    transactions = newList;
    saveData();
    updateAll();
}

function editTransaction(id) {
    let target;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            target = transactions[i];
            break;
        }
    }

    if (target) {
        document.getElementById('edit-id').value = target.id;
        document.getElementById('type').value = target.type;
        document.getElementById('amount').value = target.amount;
        document.getElementById('category').value = target.category;
        document.getElementById('date').value = target.date;
        document.getElementById('description').value = target.description;

        document.getElementById('form-title').innerText = "Edit Transaction";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function filterTransactions() {
    let typeFilter = document.getElementById('filter-type').value;
    let categoryFilter = document.getElementById('filter-category').value;

    let filteredList = [];

    for (let i = 0; i < transactions.length; i++) {
        let t = transactions[i];
        let matchesType = (typeFilter === 'all' || t.type === typeFilter);
        let matchesCategory = (categoryFilter === 'all' || t.category === categoryFilter);

        if (matchesType && matchesCategory) {
            filteredList.push(t);
        }
    }

    renderTable(filteredList);
}

function updateChart() {
    let categories = ['Food', 'Housing', 'Transport', 'Entertainment', 'Utilities', 'Salary', 'Other'];
    let categoryTotals = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type === 'expense') {
            let catIndex = categories.indexOf(transactions[i].category);
            if (catIndex !== -1) {
                categoryTotals[catIndex] += transactions[i].amount;
            }
        }
    }

    let ctx = document.getElementById('myChart').getContext('2d');

    if (pieChart !== null) {
        pieChart.destroy(); 
    }

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: categoryTotals,
                backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#ffb703', '#a78bfa', '#4ade80', '#94a3b8']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateAll() {
    updateSummary();
    filterTransactions(); 
    updateChart();
}
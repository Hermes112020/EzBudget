import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import firebaseConfig from '../noTouch/config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async function() {
    // Function to display totals
    async function displayTotals(accountType, lastTransactionElement, totalElement) {
        const querySnapshot = await getDocs(query(collection(db, `Users/Jake/${accountType}`), orderBy('timestamp', 'desc')));
        const transactions = querySnapshot.docs.map(doc => doc.data());

        const totalAmount = transactions.reduce((total, transaction) => total + transaction.value, 0);

        if (transactions.length > 0) {
            const lastTransaction = transactions[0];
            lastTransactionElement.textContent = `$${lastTransaction.value.toFixed(2)} ${lastTransaction.Description}: on ${formatDate(lastTransaction.timestamp.toDate())}`;
        } else {
            lastTransactionElement.textContent = "No transactions yet";
        }
        totalElement.textContent = `Total ${accountType}: $${totalAmount.toFixed(2)}`;
    }

    // Call the function to display totals for each account type when the page loads
    displayTotals('Savings', document.getElementById('lastTransactionSavings'), document.getElementById('totalSavings'));
    displayTotals('Spendings', document.getElementById('lastTransactionSpendings'), document.getElementById('totalSpendings'));
    displayTotals('Bills', document.getElementById('lastTransactionBills'), document.getElementById('totalBills'));

    // Set up real-time listeners for each account type
    ['Savings', 'Spendings', 'Bills'].forEach(accountType => {
        const collectionRef = collection(db, `Users/Jake/${accountType}`);
        const unsubscribe = onSnapshot(collectionRef, () => {
            displayTotals(accountType, document.getElementById(`lastTransaction${accountType}`), document.getElementById(`total${accountType}`));
        });
    });

    // Toggle Income Popup Visibility
    const plusSign = document.getElementById('plusSign');
    const incomePopup = document.getElementById('incomePopup');
    const closeIncomePopup = document.getElementById('closeIncomePopup');
    
    plusSign.addEventListener('click', function() {
        incomePopup.style.display = 'block';
    });
    
    closeIncomePopup.addEventListener('click', function() {
        incomePopup.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === incomePopup) {
            incomePopup.style.display = 'none';
        }
    });
    
    // Toggle Expenses Popup Visibility
    const minusSign = document.getElementById('minusSign');
    const expensesPopup = document.getElementById('expensesPopup');
    const closeExpensesPopup = document.getElementById('closeExpensesPopup');
    
    minusSign.addEventListener('click', function() {
        expensesPopup.style.display = 'block';
    });
    
    closeExpensesPopup.addEventListener('click', function() {
        expensesPopup.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === expensesPopup) {
            expensesPopup.style.display = 'none';
        }
    });
    
    // Submit Income Form
    const incomeForm = document.getElementById('incomeForm');
    
    incomeForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const description = document.getElementById('incomeDescription').value;
        const value = parseFloat(document.getElementById('incomeValue').value);

        try {
            await addIncome(description, value);
            incomeForm.reset();
            incomePopup.style.display = 'none';
            alert("Income added successfully!");
        } catch (error) {
            console.error("Error adding income: ", error);
            alert("Error adding income. Please try again.");
        }
    });
    
    // Function to add income
    async function addIncome(description, value) {
        const docData = {
            Description: description,
            value: value,
            timestamp: serverTimestamp()
        };

        const path = `Users/Jake/IncomeTransactions`;
        
        await addDoc(collection(db, path), docData);

        // Divide the income into bills, spendings, and savings based on predefined percentages
        const totalIncome = value;
        const billPercentage = 0.6; // 60%
        const spendingPercentage = 0.2; // 20%
        const savingPercentage = 0.2; // 20%

        const billAmount = totalIncome * billPercentage;
        const spendingAmount = totalIncome * spendingPercentage;
        const savingAmount = totalIncome * savingPercentage;

        // Record the divided amounts in the respective account tabs
        await addTransaction('Bills', description, billAmount);
        await addTransaction('Spendings', description, spendingAmount);
        await addTransaction('Savings', description, savingAmount);
    }
    
    // Function to add a transaction
    async function addTransaction(transactionType, description, value) {
        const docData = {
            Description: description,
            value: value,
            timestamp: serverTimestamp()
        };

        const path = `Users/Jake/${transactionType}`;
        
        await addDoc(collection(db, path), docData);
    }
    
    // Submit Expenses Form
    const expensesForm = document.getElementById('expensesForm');
    
    expensesForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const description = document.getElementById('expensesDescription').value;
        const value = parseFloat(document.getElementById('expensesValue').value);
        const account = document.getElementById('expensesAccount').value;

        try {
            await addExpense(description, value, account);
            expensesForm.reset();
            expensesPopup.style.display = 'none';
            alert("Expense recorded successfully!");
        } catch (error) {
            console.error("Error recording expense: ", error);
            alert("Error recording expense. Please try again.");
        }
    });

    // Function to add expense
    async function addExpense(description, value, account) {
        const docData = {
            Description: description,
            value: -value, // Negative value for expenses
            timestamp: serverTimestamp()
        };

        const path = `Users/Jake/ExpensesTransactions`;
        
        await addDoc(collection(db, path), docData);

        // Record the expense in the respective account tab
        await addTransaction(account, description, -value); // Negative value for expenses
    }

    // Function to format date as mm/dd/yyyy
    function formatDate(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
});

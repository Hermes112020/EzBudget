const openIncomeReportModal = document.getElementById("reportIncomeModal");
const closeIncomeReportModal = document.getElementById("closeIncomeModal");
const incomeModal = document.getElementById("incomeModal");
const openExpenseReportModal = document.getElementById('reportExpenseModal');
const closeExpenseReportModal = document.getElementById('closeExpenseModal')
const expenseModal = document.getElementById("expenseModal");

// Open and close income report Modal //
openIncomeReportModal.addEventListener("click", () => {
    incomeModal.classList.add("open");
});
closeIncomeReportModal.addEventListener("click", () => {
    incomeModal.classList.remove("open");
});
// Close report income modal if click is outside div
window.addEventListener("click", function(event) {
  if (event.target == incomeModal) {
    incomeModal.classList.remove("open");
  }});

// Open and close expsense report modal
openExpenseReportModal.addEventListener('click', () => {
    expenseModal.classList.add('open');
});
closeExpenseReportModal.addEventListener('click', () => {
    expenseModal.classList.remove('open')
});

// Close report expense modal if click is outside div
window.addEventListener("click", function(event) {
  if (event.target == expenseModal) {
    expenseModal.classList.remove("open");
  }});


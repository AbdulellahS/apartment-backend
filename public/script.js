// Fetch Expenses
fetch('/api/expenses')
  .then((response) => response.json())
  .then((data) => {
    console.log('Expenses:', data);
    // Use data to populate the expenses list in your frontend
  })
  .catch((err) => console.error('Error:', err));
document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('month');
    const searchBox = document.getElementById('search');
    const tableBody = document.querySelector('#transactions-table tbody');
    const totalSaleAmount = document.getElementById('total-sale-amount');
    const totalSoldItems = document.getElementById('total-sold-items');
    const totalNotSoldItems = document.getElementById('total-not-sold-items');
    
    // Load data based on selected month
    const loadData = async (month) => {
      try {
        // Load transactions
        const transactionsResponse = await fetch(`/api/transactions?month=${month}`);
        const transactionsData = await transactionsResponse.json();
        updateTable(transactionsData.transactions);
        
        // Load statistics
        const statsResponse = await fetch(`/api/statistics?month=${month}`);
        const statsData = await statsResponse.json();
        totalSaleAmount.textContent = statsData.totalSaleAmount;
        totalSoldItems.textContent = statsData.totalSoldItems;
        totalNotSoldItems.textContent = statsData.totalNotSoldItems;
  
        // Load bar chart data
        const barChartResponse = await fetch(`/api/bar-chart?month=${month}`);
        const barChartData = await barChartResponse.json();
        renderBarChart(barChartData);
  
        // Load pie chart data
        const pieChartResponse = await fetch(`/api/pie-chart?month=${month}`);
        const pieChartData = await pieChartResponse.json();
        renderPieChart(pieChartData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
  
    // Update transactions table
    const updateTable = (transactions) => {
      tableBody.innerHTML = '';
      transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${transaction.productTitle}</td>
          <td>${transaction.productDescription}</td>
          <td>${transaction.productPrice}</td>
          <td>${transaction.dateOfSale}</td>
          <td>${transaction.category}</td>
        `;
        tableBody.appendChild(row);
      });
    };
  
    // Render Bar Chart
    const renderBarChart = (data) => {
      // Use a chart library like Chart.js to render the bar chart
    };
  
    // Render Pie Chart
    const renderPieChart = (data) => {
      // Use a chart library like Chart.js to render the pie chart
    };
  
    // Event listeners
    monthSelect.addEventListener('change', (e) => {
      loadData(e.target.value);
    });
  
    searchBox.addEventListener('input', async () => {
      const month = monthSelect.value;
      const searchText = searchBox.value;
      const transactionsResponse = await fetch(`/api/transactions?month=${month}&search=${searchText}`);
      const transactionsData = await transactionsResponse.json();
      updateTable(transactionsData.transactions);
    });
  
    // Load initial data
    loadData(monthSelect.value);
  });
  
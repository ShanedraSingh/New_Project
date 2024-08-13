const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/transactions', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const TransactionSchema = new mongoose.Schema({
  productTitle: String,
  productDescription: String,
  productPrice: Number,
  dateOfSale: Date,
  category: String
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// Helper function to get start and end dates for a given month
const getMonthRange = (month) => {
  const start = new Date(`2024-${month}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
};

// List Transactions with search and pagination
app.get('/api/transactions', async (req, res) => {
  const { page = 1, perPage = 10, month, search = '' } = req.query;
  const { start, end } = getMonthRange(month);

  try {
    const query = {
      dateOfSale: { $gte: start, $lt: end },
      $or: [
        { productTitle: { $regex: search, $options: 'i' } },
        { productDescription: { $regex: search, $options: 'i' } },
        { productPrice: { $regex: search, $options: 'i' } }
      ]
    };
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    const count = await Transaction.countDocuments(query);
    res.json({ transactions, count });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Statistics API
app.get('/api/statistics', async (req, res) => {
  const { month } = req.query;
  const { start, end } = getMonthRange(month);

  try {
    const totalSales = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end }, productPrice: { $gt: 0 } } },
      { $group: { _id: null, totalAmount: { $sum: '$productPrice' }, totalSoldItems: { $sum: 1 } } }
    ]);

    const totalItems = await Transaction.countDocuments({ dateOfSale: { $gte: start, $lt: end } });
    const totalNotSoldItems = totalItems - totalSales[0]?.totalSoldItems;

    res.json({
      totalSaleAmount: totalSales[0]?.totalAmount || 0,
      totalSoldItems: totalSales[0]?.totalSoldItems || 0,
      totalNotSoldItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Bar Chart Data API
app.get('/api/bar-chart', async (req, res) => {
  const { month } = req.query;
  const { start, end } = getMonthRange(month);

  try {
    const data = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end }, productPrice: { $gt: 0 } } },
      {
        $bucket: {
          groupBy: '$productPrice',
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Pie Chart Data API
app.get('/api/pie-chart', async (req, res) => {
  const { month } = req.query;
  const { start, end } = getMonthRange(month);

  try {
    const data = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Combined Data API
app.get('/api/combined-data', async (req, res) => {
  const { month } = req.query;
  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:3000/api/transactions?month=${month}`),
      axios.get(`http://localhost:3000/api/statistics?month=${month}`),
      axios.get(`http://localhost:3000/api/bar-chart?month=${month}`),
      axios.get(`http://localhost:3000/api/pie-chart?month=${month}`)
    ]);

    res.json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

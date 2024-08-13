const mongoose = require('mongoose');
const axios = require('axios');

const TransactionSchema = new mongoose.Schema({
  productTitle: String,
  productDescription: String,
  productPrice: Number,
  dateOfSale: Date,
  category: String
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

const initializeDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/transactions', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    mongoose.connection.close();
  }
};

initializeDatabase();

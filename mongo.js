const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/baza', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  quantity: Number,
  unit: String
});

const Product = mongoose.model('Product', productSchema);

async function createProduct() {
  const product = new Product({
    name: 'Apple',
    price: 1.5,
    description: 'Fresh red apples',
    quantity: 100,
    unit: 'kg'
  });

  const result = await product.save();
  console.log(result);
}

async function createManyProducts() {
  const products = [
    { name: 'Banana', price: 1.2, description: 'Ripe bananas', quantity: 200, unit: 'kg' },
    { name: 'Orange', price: 2.0, description: 'Juicy oranges', quantity: 150, unit: 'kg' },
    { name: 'Milk', price: 0.8, description: 'Fresh milk', quantity: 50, unit: 'liter' }
  ];

  const result = await Product.insertMany(products);
  console.log(result);
}

async function getProducts() {
  const products = await Product.find();
  console.log(products);
}

createProduct().then(() => createManyProducts()).then(() => getProducts());
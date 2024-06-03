const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/baza', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const app = express();

app.use(express.json());

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  quantity: Number,
  unit: String
});

const Product = mongoose.model('Product', productSchema);

//Przykład polecenia: curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d "{\"name\":\"Grapes\",\"price\":2.5,\"description\":\"Fresh green grapes\",\"quantity\":50,\"unit\":\"kg\"}"
app.post('/products', async (req, res) => {
    const { name } = req.body;
  
    try {
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(400).send('Product with this name already exists.');
      }
  
      const product = new Product(req.body);
      const result = await product.save();
      res.status(201).send(result);
    } catch (error) {
      res.status(400).send(error);
    }
});

//Przykład polecenia: curl "http://localhost:3000/products?name=apple"
app.get('/products', async (req, res) => {
  const { name, minPrice, maxPrice, minQuantity, maxQuantity, sortBy, order } = req.query;

  const filter = {};
  if (name) filter.name = new RegExp(name, 'i');
  if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
  if (minQuantity) filter.quantity = { ...filter.quantity, $gte: parseInt(minQuantity) };
  if (maxQuantity) filter.quantity = { ...filter.quantity, $lte: parseInt(maxQuantity) };

  let sort = {};
  if (sortBy) {
    const sortOrder = order === 'desc' ? -1 : 1;
    sort[sortBy] = sortOrder;
  }

  try {
    const products = await Product.find(filter).sort(sort);
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Przykład polecenia: curl -X PUT http://localhost:3000/products/665dfe2dc5893a1e59b004c2 -H "Content-Type: application/json" -d "{\"name\":\"New Grapes\",\"price\":3.0,\"description\":\"Ripe grapes\",\"quantity\":100,\"unit\":\"kg\"}"
app.put('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const newData = req.body;
  
    try {
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).send('Product not found.');
      }
  
      existingProduct.set(newData);
      const updatedProduct = await existingProduct.save();
  
      res.send(updatedProduct);
    } catch (error) {
      res.status(400).send(error);
    }
});  

//Przykład polecenia: curl -X DELETE http://localhost:3000/products/665dfe2dc5893a1e59b004c2
app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;
  
    try {
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).send('Product not found.');
      }
  
      if (existingProduct.quantity <= 0) {
        return res.status(400).send('Product is out of stock.');
      }
  
      await Product.deleteOne({ _id: productId });
  
      res.send('Product deleted successfully.');
    } catch (error) {
      res.status(500).send(error);
    }
});

//Przykład polecenia: curl -X GET http://localhost:3000/inventory-report
app.get('/inventory-report', async (req, res) => {
    try {
      const report = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' },
            totalPrice: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        }
      ]);
  
      if (report.length === 0) {
        return res.status(404).send('No products found.');
      }

      res.send(report[0]);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

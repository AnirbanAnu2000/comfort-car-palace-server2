const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.voxe2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
      await client.connect();
      const database = client.db('comfortCarPalace');
      const usersCollection = database.collection('users');
      const productsCollection = database.collection('products');
      const exploreCollection = database.collection('explore');
      const ordersCollection = database.collection('orders');
      const reviewCollection = database.collection('review');

      // save users data
      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      });

      app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      });

      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
      })
      
      // Make admin API
      app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })

      // GET API for all products
      app.get('/products', async (req, res) => {
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
      });

      // GET API for all explore products
      app.get('/explore', async (req, res) => {
        const cursor = exploreCollection.find({});
        const explore = await cursor.toArray();
        res.send(explore);
      });
      
      // POST API for explore products
      app.post('/explore', async (req, res) => {
        const explore = req.body;
        const result = await exploreCollection.insertOne(explore);
        console.log(result);
        res.json(result)
      });  

      // GET API for a single explore product
      app.get('/explore/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const explore = await exploreCollection.findOne(query);
        res.json(explore);
    });  

    // POST API for products
      app.post('/products', async (req, res) => {
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        console.log(result);
        res.json(result)
      });  

    // DELETE API for manage products 
      app.delete('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.json(result);
      });

    // DELETE API for manage explore ===================
      app.delete('/explore/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await exploreCollection.deleteOne(query);
        res.json(result);
      });
        
    // GET API for all review
      app.get('/review', async (req, res) => {
        const cursor = reviewCollection.find({});
        const review = await cursor.toArray();
        res.send(review);
      });

    // POST API for review
      app.post('/review', async (req, res) => {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        console.log(result);
        res.json(result)
      });    

    // GET API for a single product
      app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await productsCollection.findOne(query);
        res.json(product);
      });

    // POST API all orders 
      app.post('/orders', async (req, res) => {
        const order = req.body;
        const result = await ordersCollection.insertOne(order);
        console.log(result);
        res.json(result)
      });

    // my orders
    app.get("/myOrders/:email", async (req, res) => {
      const result = await ordersCollection.find({
        email: req.params.email,
      }).toArray();
      res.send(result);
    }); 

    // DELETE API for my orders
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // DELETE API for manage orders
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // GET API for all orders
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // Update order status as shipped
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = { $set: { status: 'Shipped' } };
      const result = await ordersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    }
      finally {
          // await client.close();
      }
    }

    run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Running comfort car palace server');
});

app.listen(port, () => {
  console.log('Running comfort car palace server on port ', port);
})
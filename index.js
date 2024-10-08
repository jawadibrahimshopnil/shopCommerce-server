const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())

// const uri = `mongodb://127.0.0.1:27017`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdrrfs0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Database & collections
    const shopDB = client.db("shopCommerce");
    const productsCollection = shopDB.collection("products");

    // my code goes here

    app.get("/products", async(req, res)=>{
      // get data from query
      const page = parseInt(req.query?.page) || 0;
      const size = parseInt(req.query?.size) || 9;
      const { 
        brand, 
        category, 
        maxPrice, 
        minPrice, 
        searchTxt,
        sortPrice,
        sortDate
      } = req.query;

      // setting query for filter data
      const query = {};
      if (brand) query.brand = brand;
      if (category) query.category = category;
      if (searchTxt) query.name = {$regex: searchTxt, $options: 'i'};
      if (minPrice && !maxPrice) query.price = {$gte: parseInt(minPrice)};
      if (maxPrice && !minPrice) query.price = {$lte: parseInt(maxPrice)};
      if (maxPrice && minPrice) query.price = {$gte: parseInt(minPrice), $lte: parseInt(maxPrice)};

      // sorting the data
      const options = {}
      if(sortPrice === "highToLow") options.price = -1
      if(sortPrice === "lowToHigh") options.price = 1
      if(sortDate === "newFirst") options.date = -1
      if(sortDate === "oldFirst") options.date = 1

      // getting data from db
      const cursor = productsCollection.find(query).sort(options);
      const count = await productsCollection.countDocuments(query);
      const result = await cursor.skip(page * size).limit(size).toArray();

      res.send({result, count});
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Alhamdulillah server is running.')
})

app.listen(port, ()=>{
    console.log(`Bismillah, server is running on port: ${port}`)
})
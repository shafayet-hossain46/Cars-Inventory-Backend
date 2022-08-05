const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a6mdmta.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const carsCollection = client.db("carsCollection").collection("carsItems");
    const carsCollectionReviews = client.db("carsCollectionReviews").collection("reviews");

    // Get Inventory Items
    app.get("/inventory", async (req, res) => {
      const query = {};
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    // Get the id and send single data
    app.get("/manageInventoryItem/:id", async (req, res) => {
      const result = await carsCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
    
    app.put("/delivered/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carsCollection.findOne({ _id: ObjectId(id) });
      const results = await carsCollection.updateOne(result, {
        $set: { quantity: result.quantity - 1 },
      });
      res.send(results);
    });

    // Adding Quantity
    app.put("/updateQuantity/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const result = await carsCollection.findOne({ _id: ObjectId(id) });
      const results = await carsCollection.updateOne(result, {
        $set: { quantity: result.quantity + body.quantity },
      });
      res.send(results);
    });

    // Delete
    app.delete("/inventoryItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    // Posting new item
    app.post("/inventoryItem", async (req, res) => {
      const body = req.body;
      const result = await carsCollection.insertOne(body); // Inserting 
      const insertedItem = await carsCollection.findOne({_id: result.insertedId}); // Finding the inserted id and sending it as response
      res.send(insertedItem);
    });


    // Getting My Items
    app.get("/myItems", async (req, res) => {
      const query = req.query.email;
      const result = await carsCollection.find({email: query}).toArray();
      res.send(result);
    })


    // Reviews
    app.post("/reviews", async (req, res)=> {
      const body = req.body;
      const result = await carsCollectionReviews.insertOne(body);
      res.send(result)
    })


    // Get Reviews
    app.get("/reviews", async (req, res) =>{
      const result = await carsCollectionReviews.find({}).toArray();
      res.send(result);
    })




  } finally {
    // await client.close();
  }
}
run().catch(console.dir());

app.listen(port, () => {
  console.log("Listening to port ", port);
}); 

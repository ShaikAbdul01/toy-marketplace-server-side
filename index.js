const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// toyCarPlaza
// WU1voWpjEk33zGK6

const uri =
  "mongodb+srv://toyCarPlaza:WU1voWpjEk33zGK6@cluster0.5yf9dzl.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCarCollection = client.db("toyCar").collection("cars");
    const addToysCollection = client.db("toyCar").collection("addToy");

    app.get("/cars", async (req, res) => {
      const cursor = toyCarCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCarCollection.findOne(query);
      res.send(result);
    });

    app.get("/addToys", async (req, res) => {
      const cursor = addToysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/addToys/id/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addToysCollection.findOne(query);
      res.send(result);
    });

    app.get("/addToys/email/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      try {
        const result = await addToysCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error retrieving toy data:", error);
        res.status(500).send("An error occurred while retrieving toy data.");
      }
    });

    app.post("/addToys", async (req, res) => {
      const toys = req.body;
      const result = await addToysCollection.insertOne(toys);
      res.send(result);
    });

    app.put("/addToys/id/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedBody = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            carName: updatedBody.carName,
            picture: updatedBody.picture,
            price: updatedBody.price,
            email: updatedBody.email,
            description: updatedBody.description,
            quantity: updatedBody.quantity,
            rating: updatedBody.rating,
            sellerName: updatedBody.sellerName,
            subCategory: updatedBody.subCategory,
          },
        };
        const result = await addToysCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating toy:", error);
        res.status(500).send("An error occurred while updating the toy.");
      }
    });

    app.delete("/addToys/id/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await addToysCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting toy:", error);
        res.status(500).send("An error occurred while deleting the toy.");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ToyCarPlaza server is running");
});

app.listen(port, () => {
  console.log(`API is running on port : ${port}`);
});

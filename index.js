const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "https://toy-car-plaza.web.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://toy-car-plaza.web.app");
  next();
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5yf9dzl.mongodb.net/?retryWrites=true&w=majority`;

// const uri = "mongodb+srv://<username>:<password>@cluster0.5yf9dzl.mongodb.net/?retryWrites=true&w=majority";

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

    const categoryCollection = client.db("toyCar").collection("carsToy");
    const toyCarCollection = client.db("toyCar").collection("cars");
    const addToysCollection = client.db("toyCar").collection("addToy");

    app.get("/carsToy", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/carsToy/categories", async (req, res) => {
      const query = {}; // An empty query will match all documents

      const result = await categoryCollection.find(query).toArray();

      res.send(result);
    });

    app.get(
      "/carsToy/:categoryName/:subCategoryName/:toyName",
      async (req, res) => {
        const categoryName = req.params.categoryName;
        const subCategoryName = req.params.subCategoryName;
        const toyName = req.params.toyName;
        const query = {
          "categories.name": categoryName,
          "categories.subCategories.name": subCategoryName,
          "categories.subCategories.toys.name": toyName,
        };
        const result = await categoryCollection.findOne(query);
        if (result) {
          // Find the specific toy within the nested structure
          const category = result.categories.find(
            (cat) => cat.name === categoryName
          );
          const subCategory = category.subCategories.find(
            (subCat) => subCat.name === subCategoryName
          );
          const toy = subCategory.toys.find((toy) => toy.name === toyName);
          res.send(toy);
        } else {
          res.status(404).send("Toy not found");
        }
      }
    );

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
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBody = req.body;
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
      const result = await addToysCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
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
    // app.options("*", cors());
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

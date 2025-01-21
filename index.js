const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kzh2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("BrandSportsDB");
const EquipmentCollection = database.collection("Equipment");

async function connectToMongo() {
  try {
    // await client.connect();
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Routes
app.get("/equipment", async (req, res) => {
  try {
    const email = req.query.email;
    let query = {};
    if (email) {
      query = { email: email };
    }
    const cursor = EquipmentCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send("Error fetching equipment data.");
  }
});

app.get("/equipment/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const query = { _id: new ObjectId(id) }; // Use ObjectId to find the equipment by ID
    const result = await EquipmentCollection.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "Equipment not found" });
    }

    res.send(result);
  } catch (error) {
    res.status(500).send("Error fetching equipment details.");
  }
});

app.post("/equipment", async (req, res) => {
  const newEquip = req.body;

  try {
    const result = await EquipmentCollection.insertOne(newEquip);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send("Error adding equipment.");
  }
});

app.put('/equipment/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedDoc = {
    $set: req.body,
  };

  const result = await EquipmentCollection.updateOne(filter, updatedDoc, options);

  res.send(result);
});

app.delete("/equipment/:id", async (req, res) => {
  console.log("going to delete", req.params.id);
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await EquipmentCollection.deleteOne(query);
  res.send(result);
});

// Health Check Route
app.get("/", (req, res) => {
  res.send("BrandSports server is running");
});

// Start the server and MongoDB connection
connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`BrandSports server is running on port ${port}`);
  });
});

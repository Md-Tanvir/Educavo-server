const express = require("express");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b0w5j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Educavooo Server Is Running");
});

client.connect((err) => {
  const coursesCollection = client.db("educavo").collection("courses");
  const reviewsCollection = client.db("educavo").collection("reviews");
  const ordersCollection = client.db("educavo").collection("orders");
  const usersCollection = client.db("educavo").collection("users");

  // GET ALL COURSES

  app.get("/courses", async (req, res) => {
    const result = await coursesCollection.find({}).toArray();
    res.send(result);
  });
  //   ADD NEW COURSE
  app.post("/addCourse", async (req, res) => {
    const result = await coursesCollection.insertOne(req.body);
    res.send(result);
  });

  // DELETE ANY COURSE

  app.delete("/deleteCourse/:id", async (req, res) => {
    const result = await coursesCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });

  // GET ALL REVIEWS

  app.get("/reviews", async (req, res) => {
    const result = await reviewsCollection.find({}).toArray();
    res.send(result);
  });

  // MAKING REVIEW DATA
  app.post("/reviews", async (req, res) => {
    const user = req.body;
    const result = await reviewsCollection.insertOne(user);
    res.send(result);
  });

  // CONFIRM YOUR ORDER

  app.post("/confirmOrder", async (req, res) => {
    const result = await ordersCollection.insertOne(req.body);
    res.send(result);
  });

  //GET ALL ORDERS

  app.get("/allOrders", async (req, res) => {
    const cursor = ordersCollection.find({});
    const orders = await cursor.toArray();
    res.send(orders);
  });

  // DELETE ANY ORDER

  app.delete("/deleteOrder/:id", async (req, res) => {
    const result = await ordersCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.send(result);
  });

  // UPDATE ORDER STATUS
  app.put("/allOrders/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const option = { upsert: true };
    const updateStatus = { $set: { status: "Shipped" } };
    const result = await ordersCollection.updateOne(
      filter,
      updateStatus,
      option
    );
    res.json(result);
  });

  // LOGGED USER ORDERS
  app.get("/myOrders/:email", async (req, res) => {
    const result = await ordersCollection
      .find({ email: req.params.email })
      .toArray();
    res.send(result);
  });

   // MAKING USER COLLECTION
   app.put("/users", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  });

 //GIVING ADMIN ROLE
 app.put("/users/admin", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { role: "admin" } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);
  });

  //SPECIAL FOR ADMIN
  app.get("/users/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === "admin") {
      isAdmin = true;
    }
    res.send({ admin: isAdmin });
  });

  // MAKING USER DATA
  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });


});

app.listen(port, () => {
  console.log(`Server Is Running On Port:`, port);
});

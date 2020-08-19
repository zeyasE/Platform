const express = require("express");
const app = express();
const port = process.env.port || 3000;
const path = require("path");
const pageNotFoundController = require("./controllers/page-not-found-controller.js");
const dataUser = require("./models/datauser.js");
const mongoose = require("mongoose");
const uri =
  "mongodb+srv://iwing:iwingku77@cluster0.3abk6.mongodb.net/iwing?retryWrites=true&w=majority";
// const MongoClient = require("mongodb").MongoClient;
// const client = new MongoClient(uri, { useNewUrlParser: true });

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.json());

const datauser = [{}];

app.post("/testpost", async (req, res) => {
  const payload = req.body;
  const datauser = new dataUser(payload);
  await datauser.save();
  res.status(201).end();
});

app.get("/testget", async (req, res) => {
  const datauser = await dataUser.find();
  res.json(datauser);
});
app.get("/testget/:name", async (req, res) => {
  const { name } = req.params;
  const datauser = await dataUser.find({ name: name });
  res.json(datauser);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("*", pageNotFoundController);

mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => {
    console.log("We are connected to Mongoose");
  })
  .catch((error) => {
    console.log("MongoDB error", error);
  });

// mongoose.connection.on("error", (err) => {
//   if (!err) console.log("We are connected");
//   console.error("MongoDB error", err);
// });
// (uri, (err, db) => {
//   if (!err) console.log("We are connected");
//   else console.log("Cannot Connect to Database!!!");
// });

app.listen(port, () => {
  console.log(
    `This is Platform for Manage Tracking Device \nServer is running on port ${port}`
  );
});

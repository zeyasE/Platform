const express = require("express");
const app = express();
const port = process.env.port || 3000;
const path = require("path");
const pageNotFoundController = require("./controllers/page-not-found-controller.js");
const mainController = require("./controllers/main-controller.js");
const addnRegister = require("./controllers/addnregister-controller.js");
const allProject = require("./controllers/allProject.js");
const dataUser = require("./models/datauser.js");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const uri =
  "mongodb+srv://iwing:iwingku77@cluster0.3abk6.mongodb.net/iwing?retryWrites=true&w=majority";
// const MongoClient = require("mongodb").MongoClient;
// const client = new MongoClient(uri, { useNewUrlParser: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/apipost", async (req, res) => {
  const payload = req.body;
  const datauser = new dataUser(payload);
  await datauser.save();
  res.status(201).end();
});

app.put("/apiput/:namedevice", async (req, res) => {
  const payload = req.body;
  const { namedevice } = req.params;
  const datauser = await dataUser.findOneAndUpdate(
    { name: namedevice },
    { $set: payload },
    { new: true },
    (err, doc) => {
      if (err) console.log(`Something wrong when update ${namedevice}`);
      console.log(`Update success ${namedevice}`);
    }
  );
  res.json(datauser);
});

app.get("/apiget", async (req, res) => {
  const datauser = await dataUser.find();
  res.json(datauser);
});
app.get("/apiget/:type", async (req, res) => {
  const { type } = req.params;
  const datauser = await dataUser.find({ type: type });
  res.json(datauser);
});
app.get("/apiget/:name", async (req, res) => {
  const { name } = req.params;
  const datauser = await dataUser.find({ name: name });
  res.json(datauser);
});

app.get("/add", addnRegister);
app.get("/all", allProject);
app.get("/", mainController);
app.get("*", pageNotFoundController);

mongoose
  .connect(uri, { useNewUrlParser: true })
  .then(() => {
    console.log("We are connected to Mongoose");
  })
  .catch((error) => {
    console.log("MongoDB error", error);
  });

app.listen(port, () => {
  console.log(
    `This is Platform for Manage Tracking Device \nServer is running on port ${port}`
  );
});

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
const axios = require("axios");
const setting = require("./settings.js");
const { find } = require("./models/datauser.js");
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
  try {
    const payload = req.body;
    const datauser = new dataUser(payload);
    await datauser.save();
    res.status(201).end();
  } catch (error) {
    res.status(404).send(error);
  }
});

// create raspi
app.post("/apipost/raspi", async (req, res) => {
  try {
    const datauser = new dataUser({
      name: req.body.nameraspi,
      type: "Raspberry",
      userId: "Test",
      descrip: req.body.descripraspi,
      dconnect: "none"
    });
    await datauser.save();
    res.redirect(req.get('referer'));
  } catch (error) {
    res.status(202).send(`<p>Sorry this name is used.<p>`);

    // const errname = 'Sorry this name is used.';
    // res.status(200).render("addnregister.ejs", { errname : errname})
  }
});

// create iot
app.post("/apipost/:nameras/iot", async (req, res) => {
  try {
    const { nameras } = req.params;
    if (nameras === null)
      res.status(404).end();
    const raspdata = await dataUser.findOne({ name: nameras });
    const datauser = new dataUser({
      name: req.body.nameiot,
      type: "device",
      userid: "Test",
      descrip: req.body.descripiot,
      dconnect: raspdata["_id"]
    });
    await datauser.save();
    res.redirect(req.get('referer'));
  } catch {
    res.status(202).send(`<p>Sorry this name is used.<p>`);
  }
})

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

//reserve => apidelete
app.delete("/testapidelete/:name", async (req, res) => {
  const name = req.params.name;
  const datauser = await dataUser.findOneAndRemove({ name: name });
  res.sendStatus(204).send();
});

//main => apidelete
app.get("/apidelete/:name", async (req, res) => {
  const name = req.params.name;
  const datauser = await dataUser.findOneAndRemove({ name: name }, (err, doc) => {
    if (err) console.error(err);
    res.redirect(req.get('referer'));
  });
});

// test get find
// get all raspi&iot
app.get("/apiget", async (req, res) => {
  const datauser = await dataUser.find();
  res.json(datauser);
});
// get only about this name
app.get("/apiget/n/:name", async (req, res) => {
  const { name } = req.params;
  const datauser = await dataUser.findOne({ name: name });
  res.json(datauser);
});
// get all that type
app.get("/apiget/t/:type", async (req, res) => {
  const { type } = req.params;
  const datauser = await dataUser.find({ type: type });
  res.json(datauser);
});
// get all iot that connect to this raspi
app.get("/apiget/sr/:name", async (req, res) => {
  const { name } = req.params;
  const idRasPi = await dataUser.findOne({ name: name });
  const datauser = await dataUser.find({ dconnect: idRasPi["_id"] })
  res.json(datauser);
});

app.get("/selectraspi/:name", async (req, res, next) => {
  try {
    const { name } = req.params;
    const idRasPi = await dataUser.findOne({ name: name });
    const datauser = await dataUser.find({ dconnect: idRasPi["_id"] });
    res.status(200).render("selectraspi.ejs", { dataRasPiObj: datauser, nameRasPi: name });
  } catch (error) {
    res.status(404).send(error);
  }
  // const noRasPi = await axios
  // .get(`${setting.apiURLselectRasPi}/${name}`)
  // .then(res => {
  //   return res.data;
  // })
  // .catch(err => { 
  //   res.status(404).send(err)
  // })
  // res.status(200).send(noRasPi)
});

app.get("/selectiot/:name");
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

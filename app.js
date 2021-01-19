const express = require("express");
const app = express();
const port = process.env.port || 3000;
const path = require("path");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
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
const { reset } = require("nodemon");
const { raw } = require("body-parser");
const uri =
  "mongodb+srv://iwing:iwingku77@cluster0.3abk6.mongodb.net/iwing?retryWrites=true&w=majority";
// const MongoClient = require("mongodb").MongoClient;
// const client = new MongoClient(uri, { useNewUrlParser: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

console.log("hello world");

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
      password: req.body.password,
      ip: req.body.ip
    });
    await datauser.save();
    res.status(202).send({ datauser });
    // res.redirect(`/selectraspi/${req.body.nameraspi}`);
    // $("#formraspi").submit((e) => {
    //   e.preventDefault();
    // })
    // $("#listproject").load(window.location.href + " #listproject");
  } catch (err) {
    res.status(404).send({ err });
    // res.status(200).render("/apipost/raspi", { err: message });
    // res.status(404).send(message);
    // $("#alertname").append(message);
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
      dconnect: raspdata["_id"],
      // iotgraph: {
      //   graphname: "",
      //   dataposition: "",
      //   typegraph: "",
      //   color: "",
      // },
      graph: {
        time: "",
        data: "",
      },
    });
    await datauser.save();
    res.status(202).send({ datauser });
  } catch (err) {
    res.status(404).send({ err });
  }
})

// save data about graph that user build
app.put("/apiput/dashboard/:namedevice", async (req, res) => {
  const { namedevice } = req.params;
  const datauser = await dataUser.findOneAndUpdate(
    { name: namedevice },
    {
      $addToSet: {
        iotgraph: {
          graphname: req.body.graphname,
          dataposition: req.body.datapositon,
          typegraph: req.body.typegraph,
          color: req.body.colorgraph,
          xaxis: req.body.xaxis,
          yaxis: req.body.yaxis,
        }
      },
    },
    (err, doc) => {
      if (err) console.log(`Something wrong when update ${namedevice}`);
    }
  )
  // console.log(datauser);
  res.status(202).send(datauser);
})

// add data from iot to collect in graph array
app.put("/apiput/iotdata/:namedevice", async (req, res) => {
  var payload = req.body;
  const { namedevice } = req.params;
  const datauser = await dataUser.findOneAndUpdate(
    { name: namedevice },
    // { type: "device" },
    {
      $addToSet: { graph: payload },
    },
    (err, doc) => {
      if (err) console.log(`Something wrong when update ${namedevice}`);
      console.log(`Update success ${namedevice}`);
    }
  );
  res.json(datauser);
});

// {
//   "type": "device",
//   "status": true,
//   "dconnect" : "5f3cefd05b9b8e5730efd9a7",
//   "name" : "Haowj",
//   "userId" : "123",
//   "descrip" : "test1"
// }

// test edit method PUT
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
  try {
    const name = req.params.name;
    const datauser = await dataUser.findOneAndRemove({ name: name });
    res.sendStatus(204);
  } catch (error) {
    res.status(404).send(error);
  }
});

//main => apidelete
app.get("/apidelete/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const datauser = await dataUser.findOneAndRemove({ name: name }, (err, doc) => {
      // res.redirect(req.get('referer'));
      res.status(202);
    });
  } catch (error) {
    res.status(404).send(error);
  }
});

// delete ras pi and all iot connect to this ras pi
app.get("/apidelete/ras/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const idraspi = await dataUser.findOne({ name: name });
    const devices = await dataUser.deleteMany({ dconnect: idraspi["_id"] });
    const deleteraspi = await dataUser.findOneAndRemove({ name: name });
    // res.redirect(req.get('referer'));
  } catch (error) {
    res.status(404).send(error);
  }
})

//delete graph
app.get("/apidelete/graph/:name/:id", async (req, res) => {
  try {
    const { name, id } = req.params;
    // const datauser = await dataUser.findOne({ name: name });
    const iotgraph = await dataUser.findOneAndUpdate(
      { name: name },
      {
        $pull: {
          iotgraph: {
            _id: id
          }
        }
      },
      { new: true },
      (err, doc) => {
        if (err) console.log(`Something wrong when update ${name}`);
        console.log(`Update success ${name}`);
      }
    );
    // res.redirect(req.get('referer'));
    // console.log(datauser);
    // console.log(iotgraph);
    res.send(iotgraph);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
})

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

// get raw data
app.get("/apiget/rawdata/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const datauser = await dataUser.findOne({ name: name });
    const rawdata = datauser.graph.slice(1, datauser.graph.length);

    // rawdata.forEach((element) => {
    //   element.data.forEach((e) => {
    //     console.log(e)
    //   });
    // });

    // const newmap = rawdata.map((e) => {
    //   return e.data;
    // })
    // console.log(newmap)
    res.json(rawdata);
  } catch (error) {
    res.send(error);
  }
});

app.get("/selectraspi/:name", async (req, res, next) => {
  try {
    const { name } = req.params;
    const idRasPi = await dataUser.findOne({ name: name });
    const datauser = await dataUser.find({ dconnect: idRasPi["_id"] });
    res.status(200).render("selectraspi.ejs", { dataRasPiObj: datauser, nameRasPi: name, status: idRasPi.status });
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

app.get("/dashboard/:name", async (req, res, next) => {
  try {
    var { name } = req.params;
    var iotdata = await dataUser.findOne({ name: name });
    var graphdata = iotdata.graph;
    var amountdata = graphdata[iotdata.graph.length - 1].data.length;

    // setInterval(() => {
    //   let date_ob = new Date();
    //   let date = ("0" + date_ob.getDate()).slice(-2);
    //   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    //   let year = date_ob.getFullYear();
    //   let hours = ("0" + date_ob.getHours()).slice(-2);
    //   let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    //   let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    //   console.log(year + month + date + hours + minutes + seconds);
    // }, 1000);
    // console.log(iotdata);
    // console.log(graphdata);
    if (iotdata === {}) {
      res.send("please");
    } else {
      res.status(200).render("iotdev.ejs", { nameiotdev: name, amountdata: amountdata, exampledata: graphdata, status: iotdata.status });
    }
  } catch (error) {
    res.status(404).send(error);
  }
})

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

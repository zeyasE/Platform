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
const mqtt = require("mqtt");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const axios = require("axios");
const setting = require("./settings.js");
const { find } = require("./models/datauser.js");
const { reset } = require("nodemon");
const { raw } = require("body-parser");
const uri =
  "mongodb+srv://iwing:iwingku77@cluster0.3abk6.mongodb.net/iwing?retryWrites=true&w=majority";
// const MongoClient = require("mongodb").MongoClient;
// const client = new MongoClient(uri, { useNewUrlParser: true });

// new mqttconnect('myhome', 'myraspi', '192.168.1.194').startmqtt();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

// decoder.write(Buffer.from([0xE2]));
// decoder.write(Buffer.from([0x82]));
// console.log(decoder.end(Buffer.from([0xAC])));

function gettime() {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = ("0" + date_ob.getHours()).slice(-2);
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob.getSeconds()).slice(-2);
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}
// 2020-05-9

async function getonline() {
  const datauser = await dataUser.find();
  datauser.forEach((e) => {
    if (e.status) new mqttconnect(e.name, e.password, e.ip).startmqtt();
  })
}

async function updatestatus(name, status) {
  const datauser = await dataUser.findOneAndUpdate(
    { name: name },
    { $set: { status: status } },
    { new: true },
    (err, doc) => {
      if (err) console.log(`Error on raspberry ${name} is: ${err}`);
      if (!status) console.log(`Raspberry ${name} offline`);
    }
  )
}

async function findandsave(nameraspi, iot, message) {
  const inforaspi = await dataUser.findOne({ name: nameraspi });
  const topics = await dataUser.findOne(
    { name: iot },
    { dconnect: inforaspi._id }
  );
  // console.log(decoder.end(Buffer.from(message)).split(","));
  let newmessage = decoder.end(Buffer.from(message)).split(",");
  if (topics === null) {
    const newiot = new dataUser({
      name: iot,
      type: "device",
      dconnect: inforaspi._id,
      descrip: `automatic connect from ${nameraspi}`,
      graph: {
        time: "",
        data: "",
      },
    })
    await newiot.save();
    if (true) {
      const updateiot = await dataUser.findOneAndUpdate(
        { name: iot, dconnect: inforaspi._id },
        {
          $addToSet: {
            graph: {
              //gettime()
              //message
              time: `${newmessage[0]}`,
              data: `${newmessage.slice(1)}`
            }
          }
        }, (err, doc) => {
          if (err) console.log(`${nameraspi} Error input data on : ${iot}` + err);
        }
      );
    }
  } else if (topics !== null) {
    if (true) {
      // console.log(message);
      const updateiot = await dataUser.findOneAndUpdate(
        { name: iot, dconnect: inforaspi._id },
        {
          $addToSet: {
            graph: {
              time: `${newmessage[0]}`,
              data: `${newmessage.slice(1)}`
            }
          }
        }, (err, doc) => {
          if (err) console.log(`${nameraspi} Error input data on : ${iot}` + err);
        }
      );
    }
  } else {
    console.log("error");
  }
}

class mqttconnect {
  constructor(user, password, server) {
    this.server = server
    this.user = user
    this.password = password
  }
  startmqtt() {
    var port = "1883";
    var topic = '#';
    var user = this.user;
    var countstatus = 1;
    var client = mqtt.connect({
      host: this.server,
      port: port,
      username: this.user,
      password: this.password
    })
    client.on('connect', function () {
      // Subscribe any topic
      updatestatus(user, true);
      console.log("MQTT Connect to" + user);
      client.subscribe(topic, function (err) {
        // console.log("Subscribed to " + topic);
        if (err) {
          console.log(err);
        }
      });
    });

    client.on("error", function (error) {
      console.log("ERROR: ", error);
      updatestatus(user, false);
      client.end()
    });
    client.on('reconnect', function () {
      console.log("Reconnect to " + user + ` ${[countstatus]}`);
      // update coming soon : add page download
      if (countstatus === 3) {
        updatestatus(user, false);
        client.end();
      }
      countstatus += 1;
    });
    // client.on('offline', function () {
    //   console.log("offline");
    //   // client.end()
    // });
    client.on('message', function (topic, message, packet) {
      findandsave(user, topic, message);
      // console.log(topic + ": " + message.toString());
    });
  }
}

getonline();
// io.on('connection', (socket) => {
//   io.emit('startserver', { server: "a user connected" });
//   console.log('user connected');
//   socket.on('chat message', (msg) => {
//     io.emit('chat message', msg);
//   });
//   socket.on('disconnect', () => {
//     io.emit('startserver', { server: "user disconnected" });
//   })
//   socket.on('chat message', (msg) => {
//     console.log('message: ' + msg);
//     // gettest();
//     // new mqttconnect(msg, 'myraspi', '192.168.1.194').startmqtt();
//   });
// });

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
  } catch (err) {
    res.status(404).send({ err });
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

//601c37a2d0d8d33768bbaed3
app.put("/apiput/import/:name/:id", async (req, res) => {
  var dataimport;
  const { name, id } = req.params;
  const payload = req.body;
  const datauser = await dataUser.findOne({ name: name, type: "device" });
  // for (let i = 0; i < datauser.iotgraph.length; i++) {
  //   if (datauser.iotgraph[i]._id.toString() === id.toString()) {
  dataimport = await dataUser.findOneAndUpdate(
    { name: name, iotgraph: { "$elemMatch": { "_id": id } } },
    {
      $addToSet: {
        "iotgraph.$.dataimport": payload
        // {
        //   nameimport: req.body.graphname,
        //   datapos: req.body.graphname,
        //   colori: req.body.graphname
        // }
      }
    },
    (err, doc) => {
      if (err) console.log(`Something wrong when update ${name}`);
      console.log(`Update success ${name}`);
    }
  )
  //   // const datauser = await dataUser.findOneAndUpdate(
  //   { name: name, type: "device" },
  //   // { type: "device" },
  //   // {
  //   //   iotgraph: {
  //   //     graphname: "GPSformdog"
  //   //   }
  //   //   // $addToSet: {
  //   //   //   iotgraph: {
  //   //   //     graphname: req.body.graphname,
  //   //   //     dataposition: req.body.datapositon,
  //   //   //     typegraph: req.body.typegraph,
  //   //   //     color: req.body.colorgraph,
  //   //   //     xaxis: req.body.xaxis,
  //   //   //     yaxis: req.body.yaxis,
  //   //   //   }
  //   //   // },
  //   // },
  //   (err, doc) => {
  //     if (err) console.log(`Something wrong when update ${name}`);
  //     // console.log(`Update success ${namedevice}`);
  //   }
  // );
  res.json(dataimport);
});

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


app.put("/apiput/:namedevice", async (req, res) => {
  const payload = req.body;
  const { namedevice } = req.params;
  const datauser = await dataUser.findOneAndUpdate(
    { name: namedevice },
    { $set: payload },
    { new: true },
    (err, doc) => {
      if (err) console.log(`Something wrong when update ${namedevice}`);
      console.log(`Something wrong when update ${namedevice}`);
    }
  );
  res.json(datauser);
});

// edit ip
app.put("/apiput/ip/:namedevice", async (req, res) => {
  const { namedevice } = req.params;
  const datauser = await dataUser.findOneAndUpdate(
    { name: namedevice },
    {
      $set:
      {
        // status: true,
        ip: req.body.ip
      }
    },
    { new: true },
    (err, doc) => {
      if (err) console.log(`Something wrong when update ${namedevice}` + err);
    }
  )
  res.send(true);
})

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
      res.status(202).send(true);
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

// get api data
app.get("/apigetraw/:nameiot", async (req, res) => {
  const { nameiot } = req.params;
  const datauser = await dataUser.findOne({ name: nameiot });
  const dataiot = datauser.graph.slice(1, datauser.graph.length);
  res.json(dataiot);
});

//get graph data
app.get("/apiget/rawexport/:name/:id", async (req, res) => {
  const { name, id } = req.params;
  let dataexport = [];
  const datauser = await dataUser.findOne({ name: name });
  const alldata = await dataUser.find();
  const rawdata = datauser.graph.slice(1);
  try {
    for (let i = 0; i < datauser.iotgraph.length; i++) {
      if (String(datauser.iotgraph[i]._id) === id) {
        if (datauser.iotgraph[i].typegraph === "scattermapbox") {
          rawdata.forEach((raw) => {
            dataexport.push({
              nodename: name,
              time: raw.time,
              latitude: String(raw.data).split(",")[datauser.iotgraph[i].dataposition[0]],
              longtitude: String(raw.data).split(",")[datauser.iotgraph[i].dataposition[1]]
            })
          })
          if (datauser.iotgraph[i].dataimport !== undefined) {
            for (let j = 0; j < datauser.iotgraph[i].dataimport.length; j++) {
              alldata.forEach((each) => {
                if (each.name === datauser.iotgraph[i].dataimport[j].nameimport) {
                  let tgdata = each.graph.slice(1);
                  tgdata.forEach((data2) => {
                    dataexport.push({
                      nodename: each.name,
                      time: data2.time,
                      latitude: String(data2.data).split(",")[datauser.iotgraph[i].dataimport[j].datapos[0]],
                      longtitude: String(data2.data).split(",")[datauser.iotgraph[i].dataimport[j].datapos[1]]
                    });
                  })
                }
              })
            }
          }
        }
        else {
          rawdata.forEach((raw) => {
            dataexport.push({
              nodename: name,
              time: raw.time,
              data: String(raw.data)
            })
          })
        }
      }
      // if (dataexport !== []) {
      //   console.log(dataexport.sort(dynamicSort("time")))
      // }
    }
    // console.log(dataexport.sort(dynamicSort("time")))
    res.json(dataexport.sort(dynamicSort("time")));
  } catch (error) {
    res.send(error);
    console.log(error);
  }

})

// app.get("/apigetraw/:nameiot/:id", async (req, res) => {
//   const { nameiot, id } = req.params;
//   const datauser = await dataUser.findOne({ name: nameiot });
//   const getid = await datauser.iotgraph.findOne({ _id: id });
//   // datauser.iotgraph.forEach( (e) => {

//   // });
//   // const raw = 
//   res.json(getid);
// });

// get raw data
app.get("/apiget/rawdata/:name", async (req, res) => {
  try {
    changestatus = true;
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
    res.status(200).render("selectraspi.ejs", { dataRasPiObj: datauser, nameRasPi: name, idRasPi: idRasPi });
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get("/dashboard/:name", async (req, res, next) => {
  try {
    var { name } = req.params;
    var iotdata = await dataUser.findOne({ name: name });
    var graphdata = iotdata.graph;
    var amountdata = graphdata[iotdata.graph.length - 1].data.length;
    // var newamount = amountdata.split(",");
    // console.log(amountdata);
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

app.get("/docs", async (req, res) => {
  try {
    res.status(200).render("docs.ejs");
  } catch (error) {
    res.send(404).send(error);
  }
})
app.get("/selectiot/:name");
app.get("/add", addnRegister);
app.get("/all", allProject);
app.get("/", mainController);
app.get("*", pageNotFoundController);

// io.on('connection', (socket) => {
//   console.log('user connected');
//   //   io.emit('startserver', { server: "a user connected" });
//   // socket.on('chat message', (msg) => {
//   //     io.emit('chat message', msg);
//   // });
//   socket.on('chat message', (msg) => {
//     console.log(msg);
//     // new mqttconnect('myhome', 'myraspi', '192.168.1.194').startmqtt();
//   })
// })

io.on('connection', (socket) => {
  // io.emit('startserver', { server: "a user connected" });
  // console.log('user connected');
  // socket.on('chat message', (msg) => {
  //   io.emit('chat message', msg);
  // });
  // socket.on('disconnect', () => {
  //   io.emit('startserver', { server: "user disconnected" });
  // })
  socket.on('state', async (name) => {
    const datauser = await dataUser.findOne({ name: name });
    io.emit('returnstate', datauser.status);
  })
  socket.on('chat message', (name, password, ip) => {
    new mqttconnect(name, password, ip).startmqtt();
    // console.log('message: ' + name + " " + password + " " + ip);
    // gettest();
    // new mqttconnect(msg, 'myraspi', '192.168.1.194').startmqtt();
  });
});

mongoose
  .connect(uri, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log("We are connected to Mongoose");

  })
  .catch((error) => {
    console.log("MongoDB error", error);
  });

http.listen(port, () => {
  console.log(
    `This is Platform for Manage Tracking Device \nServer is running on port ${port} `
  );
});

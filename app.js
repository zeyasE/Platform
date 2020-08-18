const app = require("express")();
const port = process.env.port || 3000;
const path = require("path");
const pageNotFoundController = require("./public/controllers/page-not-found-controller");
const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://iwing:iwingku77@cluster0.3abk6.mongodb.net/iwing?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });

app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("*", (req, res) => {
  res.render("page-not-found.ejs");
});

MongoClient.connect(uri, (err, db) => {
  // const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  if (!err) console.log("We are connected");
  else console.log("Cannot Connect to Database!!!");
  // client.close();
});

app.listen(port, () => {
  console.log(
    `This is Platform for Manage Tracking Device \nServer is running on port ${port}`
  );
});

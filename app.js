const app = require("express")();
const port = process.env.port || 3000;
const mongoose = require("mongodb");
const config = {
  autoIndex: true,
  useNewUrlParser: true,
};
const connectionBase =
  "mongodb+srv://iwing:iwingku77@cluster0.ooosh.mongodb.net/iwing?retryWrites=true&w=majority";

app.get("/", (req, res) => {
  res.send("Hello World");
});

mongoose
  .connect(connectionBase, config)
  .then(() => {
    console.log("Database Connected!");
  })
  .catch(() => {
    console.log("Cannot Connect to Database!!!");
  });

app.listen(port, () => {
  console.log(
    `This is Platform for Manage Tracking Device \nServer is running on port ${port}`
  );
});

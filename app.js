const app = require("express")();
const port = process.env.port || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(
    `This is Platform for Manage Tracking Device \nServer is running on port ${port}`
  );
});

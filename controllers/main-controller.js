const mainPage = (req, res, next) => {
  res.render("main.ejs", {
    data: {
      message: "Welcome to Iwing",
    },
  });
};
module.exports = mainPage;

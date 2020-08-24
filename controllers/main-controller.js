const mainPage = (req, res, next) => {
  res.render("main.ejs", {
    data: {
      message: "Welcome to Platform Iwing",
    },
  });
};
module.exports = mainPage;

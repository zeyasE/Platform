const notFound = (req, res, next) => {
  res.render("page-not-found.ejs", {
    data: {
      pageName: "error404",
      message: "Dose't find page",
    },
  });
};
module.exports = notFound;

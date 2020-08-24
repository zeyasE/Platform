const notFound = (req, res, next) => {
  res.render("page-not-found.ejs", {
    data: {
      error_code: "404",
      pageName: "Error404",
      message: "Page not found",
    },
  });
};
module.exports = notFound;

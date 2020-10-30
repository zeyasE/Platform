const addnRegister = (req, res, next) => {
  res.render("addnregister.ejs", {
    data: {
      message: "",
    },
  });
};
module.exports = addnRegister;

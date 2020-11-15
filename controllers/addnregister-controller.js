const axios = require("axios");
const setting = require("../settings")
const addnRegister = async (req, res, next) => {
  const dataaddproj = await axios
  .get(`${setting.apiURLallP}`)
  .then(res => {
    return res.data;
  })
  .catch(err => {console.error(err)})
  res.status(200).render("addnregister.ejs", { dataaddpObj : dataaddproj})
};
module.exports = addnRegister;

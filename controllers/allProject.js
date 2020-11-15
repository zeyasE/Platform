const axios = require("axios");
const settings = require("../settings.js");
const allProject = async (req, res, next) => {
  const dataallP = await axios
  .get(`${settings.apiURLallP}`)
  .then(res => {
    return res.data;
  })
  .catch(err => console.log(err + " allProject.js"));
  res.status(200).render("allProject.ejs", {dataallpObj : dataallP})
};
module.exports = allProject;
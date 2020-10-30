const axios = require("axios");
const settings = require("../settings.js");
const dataallP = axios
  .get(`${settings.apiURLallP}`)
  .then(res => {
    console.log(res.data);
  })
  .catch(err => console.log(err + " allProject.js"));
const allProject = (req, res, next) => {
  // axios
  // .get(`${settings.apiURLallp}`)
  // .then( result => {
  //   const dataallp = result.data;
  //   console.log(dataallp)
    res.status(200).render("allProject.ejs", {dataallpObj : dataallP})
  // })
  // .catch(err => {
  //   console.log(err + " allProject.js");
  // });

  // res.render("allProject.ejs", {
  //   data: {
  //     message: `${dataallp}`,
  //   },
  // });
};
module.exports = allProject;
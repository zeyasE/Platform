const axios = require("axios")
const settings = require("../settings.js")
const dataallp = () =>{
    return axios.get(`${settings.apiURLallP}`)
}
module.exports = dataallp;

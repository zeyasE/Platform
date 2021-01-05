const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const datauserSchema = mongoose.Schema({
  userId: { type: String, require: true }, // if this platform have account
  type: { type: String, required: true, enum: ["Raspberry", "device"] }, // raspberry or iot
  status: { type: Boolean, required: true, default: false }, // check device connect or not
  dconnect: { type: String, require: true }, // collect id from raspberry for iot only
  name: { type: String, required: true, unique: true, maxlength: 24 },
  descrip: { type: String, require: true }, // descrip project
  apiraspi: { type: String, require: true }, // api for raspi
  apiiot: { type: String, require: true }, // api for iot
  // typegraph: { type: [String], require: true }, // type of graph for iot device
  iotgraph: [{ graphname: { type: String }, dataposition: { type: String, require: true }, typegraph: { type: String, require: true }, color: { type: String, require: true }, xaxis: { type: String, require: true }, yaxis: { type: String, require: true }, dataname: { type: String, require: true } }], // name of graph
  graph: [{ time: { type: String, require: true }, data: { type: [String], require: true }, }], // make graph
})


datauserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("datauser", datauserSchema);

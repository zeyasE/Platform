const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const datauserSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // raspberry or iot
  status: { type: Boolean, required: true, default: false }, // check device connect or not
  // details: { type: [[String]], required: true },
  userId: { type: String, require: true }, // if this platform have account
  descrip: { type: String, require:true }, // descrip project
  dconnect: { type: String, require:true }, // collect id from raspberry for iot only
});
datauserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("datauser", datauserSchema);

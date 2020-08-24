const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const datauserSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  status: { type: Boolean, required: true },
  details: { type: [[String]], required: true },
  idUser: { type: String, require: true },
});
datauserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("datauser", datauserSchema);

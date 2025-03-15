const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  sectionID: { type: String, required: true, unique: true },
  bowl: { type: String, required: true },
});

module.exports = mongoose.model('Section', sectionSchema);
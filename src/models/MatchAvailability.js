const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchAvailabilitySchema = new Schema({
    matchID: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    entry: { type: String, required: true },
    gate: { type: String, required: true },
    availableQuantity: { type: Number, required: true },
    lockedSeats: { type: Number, default: 0 },
    price: { type: Number, required: true }
});

module.exports = mongoose.model('MatchAvailability', matchAvailabilitySchema);
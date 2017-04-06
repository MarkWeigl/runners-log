const mongoose = require('mongoose');

const RunLogSchema = mongoose.Schema({
  date: {type: Date, required: true},
  time: {type: String, required: true},
  distance: {type: String, required: true},
  location: {type: String, required: true},
  weather: {type: String, required: true},
  mood: {type: String, required: true},
  notes: {type: String, required: false}
});

RunLogSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    date: this.date,
    time: this.time,
    distance: this.distance,
    location: this.location,
    weather: this.weather,
    mood: this.mood,
    notes: this.notes
  };
}

const RunLog = mongoose.model('RunLog', RunLogSchema);

module.exports = {RunLog};


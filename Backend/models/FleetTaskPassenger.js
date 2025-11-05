const mongoose = require('mongoose');

const fleetTaskPassengerSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  companyId: {
    type: Number,
    required: true,
    ref: 'Company'
  },
  fleetTaskId: {
    type: Number,
    required: true,
    ref: 'FleetTask'
  },
  workerEmployeeId: {
    type: Number,
    required: true,
   // ref: 'Employee'
  },
  pickupConfirmedAt: {
    type: Date
  },
  dropConfirmedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['PLANNED', 'PICKED', 'DROPPED', 'ABSENT'],
    default: 'PLANNED'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FleetTaskPassenger', fleetTaskPassengerSchema, 'fleetTaskPassengers');
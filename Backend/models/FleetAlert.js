const mongoose = require('mongoose');

const fleetAlertSchema = new mongoose.Schema({
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
  vehicleId: {
    type: Number,
    ref: 'FleetVehicle'
  },
  alertType: {
    type: String,
    trim: true
  },
  alertMessage: {
    type: String,
    trim: true
  },
  alertDate: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  createdBy: {
    type: Number,
    ref: 'User'
  }
});

module.exports = mongoose.model('FleetAlert', fleetAlertSchema, 'fleetAlerts');
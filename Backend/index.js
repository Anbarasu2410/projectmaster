const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const fleetVehicleRoutes = require('./routes/fleetVehicleRoutes');
const fleetTaskRoutes = require('./routes/fleetTaskRoutes');
const fleetTaskPassengerRoutes = require('./routes/fleetTaskPassengerRoutes');
const fleetAlertRoutes = require('./routes/fleetAlertRoutes');
const driverRoutes = require('./routes/driverRoutes');
const projectRoutes = require('./routes/projectRoutes'); 
//const emailRoutes = require('./routes/emailRoutes');// This is already included

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/fleet-vehicles', fleetVehicleRoutes);
app.use('/api/fleet-tasks', fleetTaskRoutes);
app.use('/api/fleet-task-passengers', fleetTaskPassengerRoutes);
app.use('/api/fleet-alerts', fleetAlertRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/projects', projectRoutes);
//app.use('/api/email', emailRoutes); // Already using projectRoutes

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ERP API is running!',
    endpoints: {
      users: '/api/users',
      companies: '/api/companies',
      employees: '/api/employees',
      fleetVehicles: '/api/fleet-vehicles',
      fleetTasks: '/api/fleet-tasks',
      fleetTaskPassengers: '/api/fleet-task-passengers',
      fleetAlerts: '/api/fleet-alerts',
      drivers: '/api/drivers',
      projects: '/api/projects'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at: http://localhost:${PORT}`);
  console.log(`🏗️ Projects API available at: http://localhost:${PORT}/api/projects`);
});
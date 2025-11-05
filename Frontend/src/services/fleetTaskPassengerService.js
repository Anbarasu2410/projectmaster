import apiService from './JsApiService';

const fleetTaskPassengerService = {
  // Create new fleet task passenger
  createFleetTaskPassenger: async (passengerData) => {
    try {
      console.log('🟡 Sending passenger data to backend:', passengerData);
      
      const response = await apiService.post('/fleet-task-passengers', passengerData);
      
      console.log('✅ Backend response for passenger:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create passenger');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in fleetTaskPassengerService.createFleetTaskPassenger:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Get all fleet task passengers
  getAllFleetTaskPassengers: async () => {
    try {
      const response = await apiService.get('/fleet-task-passengers');
      return response.data;
    } catch (error) {
      console.error('Error fetching all fleet task passengers:', error);
      throw error;
    }
  },

  // Get fleet task passenger by ID
  getFleetTaskPassengerById: async (passengerId) => {
    try {
      const response = await apiService.get(`/fleet-task-passengers/${passengerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fleet task passenger by ID:', error);
      throw error;
    }
  },

  // Get passengers by task ID
  getPassengersByTaskId: async (taskId) => {
    try {
      const response = await apiService.get(`/fleet-task-passengers/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching passengers by task ID:', error);
      throw error;
    }
  },

  // Get passengers by company ID
  getPassengersByCompany: async (companyId) => {
    try {
      const response = await apiService.get(`/fleet-task-passengers/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching passengers by company:', error);
      throw error;
    }
  },

  // Update fleet task passenger
  updateFleetTaskPassenger: async (passengerId, updateData) => {
    try {
      const response = await apiService.put(`/fleet-task-passengers/${passengerId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating fleet task passenger:', error);
      throw error;
    }
  },

  // Delete fleet task passenger
  deleteFleetTaskPassenger: async (passengerId) => {
    try {
      const response = await apiService.delete(`/fleet-task-passengers/${passengerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting fleet task passenger:', error);
      throw error;
    }
  },

  // Batch create multiple passengers
  createBatchPassengers: async (passengersData) => {
    try {
      const promises = passengersData.map(passenger => 
        apiService.post('/fleet-task-passengers', passenger)
      );
      const results = await Promise.all(promises);
      return results.map(result => result.data);
    } catch (error) {
      console.error('Error creating batch passengers:', error);
      throw error;
    }
  },

  // Get all unique employee IDs from passengers
  getAllUniqueEmployeeIds: async () => {
    try {
      const response = await apiService.get('/fleet-task-passengers');
      const passengers = response.data.data || [];
      
      // Extract unique employee IDs
      const uniqueEmployeeIds = [...new Set(passengers.map(passenger => passenger.workerEmployeeId))];
      
      console.log('✅ Found unique employee IDs:', uniqueEmployeeIds);
      return uniqueEmployeeIds;
    } catch (error) {
      console.error('Error fetching unique employee IDs:', error);
      throw error;
    }
  },

  // Get passengers grouped by employee ID
  getPassengersGroupedByEmployee: async () => {
    try {
      const response = await apiService.get('/fleet-task-passengers');
      const passengers = response.data.data || [];
      
      // Group passengers by employee ID
      const groupedByEmployee = passengers.reduce((acc, passenger) => {
        const empId = passenger.workerEmployeeId;
        if (!acc[empId]) {
          acc[empId] = [];
        }
        acc[empId].push(passenger);
        return acc;
      }, {});
      
      console.log('✅ Grouped passengers by employee ID:', Object.keys(groupedByEmployee).length, 'employees');
      return groupedByEmployee;
    } catch (error) {
      console.error('Error grouping passengers by employee:', error);
      throw error;
    }
  },

  // Get employee statistics
  getEmployeeStatistics: async () => {
    try {
      const response = await apiService.get('/fleet-task-passengers');
      const passengers = response.data.data || [];
      
      const stats = {
        totalEmployees: new Set(passengers.map(p => p.workerEmployeeId)).size,
        totalPassengerRecords: passengers.length,
        employeesWithMultipleTrips: 0,
        employeeTripCounts: {}
      };
      
      // Count trips per employee
      passengers.forEach(passenger => {
        const empId = passenger.workerEmployeeId;
        stats.employeeTripCounts[empId] = (stats.employeeTripCounts[empId] || 0) + 1;
      });
      
      // Count employees with multiple trips
      stats.employeesWithMultipleTrips = Object.values(stats.employeeTripCounts)
        .filter(count => count > 1).length;
      
      console.log('✅ Employee statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
      throw error;
    }
  },

  // Get all employee details with their passenger history
  getAllEmployeesWithDetails: async () => {
    try {
      const response = await apiService.get('/fleet-task-passengers');
      const passengers = response.data.data || [];
      
      // Create employee details object
      const employees = passengers.reduce((acc, passenger) => {
        const empId = passenger.workerEmployeeId;
        
        if (!acc[empId]) {
          acc[empId] = {
            employeeId: empId,
            employeeName: passenger.employeeName,
            employeeCode: passenger.employeeCode,
            department: passenger.department,
            totalTrips: 0,
            trips: []
          };
        }
        
        acc[empId].totalTrips++;
        acc[empId].trips.push({
          passengerId: passenger.id,
          fleetTaskId: passenger.fleetTaskId,
          companyId: passenger.companyId,
          pickupLocation: passenger.pickupLocation,
          dropLocation: passenger.dropLocation,
          status: passenger.status,
          taskDate: passenger.createdAt
        });
        
        return acc;
      }, {});
      
      const employeesArray = Object.values(employees);
      console.log('✅ Found employees with details:', employeesArray.length);
      return employeesArray;
    } catch (error) {
      console.error('Error fetching employees with details:', error);
      throw error;
    }
  }
};

export default fleetTaskPassengerService;
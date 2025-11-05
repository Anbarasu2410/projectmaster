import React, { useState, useEffect } from 'react';
import { Form, Button, Input, Table, Checkbox, Row, Col } from 'antd';
import { CheckOutlined, CloseOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';

const PassengerAssignment = ({ form }) => {
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Sample worker data with complete information for MongoDB
  const workerData = [
    { 
      id: 1, 
      workerEmployeeId: 1, // Changed from employeeId to workerEmployeeId
      employeeName: 'Rajesh Kumar', 
      employeeCode: 'EMP001',
      department: 'Welding' 
    },
    { 
      id: 2, 
      workerEmployeeId: 2, // Changed from employeeId to workerEmployeeId
      employeeName: 'Anil Mehta', 
      employeeCode: 'EMP002',
      department: 'Helper' 
    },
    { 
      id: 3, 
      workerEmployeeId: 3, // Changed from employeeId to workerEmployeeId
      employeeName: 'Suresh Singh', 
      employeeCode: 'EMP003',
      department: 'Fitter' 
    },
    { 
      id: 4, 
      workerEmployeeId: 4, // Changed from employeeId to workerEmployeeId
      employeeName: 'Priya Sharma', 
      employeeCode: 'EMP004',
      department: 'Electrical' 
    },
    { 
      id: 5, 
      workerEmployeeId: 5, // Changed from employeeId to workerEmployeeId
      employeeName: 'Meena Patel', 
      employeeCode: 'EMP005',
      department: 'Painting' 
    },
    { 
      id: 6, 
      workerEmployeeId: 6, // Changed from employeeId to workerEmployeeId
      employeeName: 'Rahul Verma', 
      employeeCode: 'EMP006',
      department: 'Welding' 
    },
    { 
      id: 7, 
      workerEmployeeId: 7, // Changed from employeeId to workerEmployeeId
      employeeName: 'Kavita Reddy', 
      employeeCode: 'EMP007',
      department: 'Helper' 
    },
    { 
      id: 8, 
      workerEmployeeId: 8, // Changed from employeeId to workerEmployeeId
      employeeName: 'Vikram Joshi', 
      employeeCode: 'EMP008',
      department: 'Fitter' 
    },
  ];

  // Filter workers based on search in name or department
  const filteredWorkers = searchText 
    ? workerData.filter(worker =>
        worker.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
        worker.department.toLowerCase().includes(searchText.toLowerCase())
      )
    : workerData;

  // Handle autofilled data from form
  useEffect(() => {
    if (!form) return;

    console.log('👥 PassengerAssignment - Component mounted with form');

    const checkAndSetPassengers = () => {
      try {
        const values = form.getFieldsValue();
        console.log('👥 PassengerAssignment - Current form values:', {
          passengers: values.passengers
        });

        if (values.passengers && Array.isArray(values.passengers) && values.passengers.length > 0) {
          console.log('🔄 Setting selected passengers from form:', values.passengers);
          
          // Map the stored passenger data to match our worker data structure
          const mappedPassengers = values.passengers.map(passenger => {
            // Find matching worker by ID or create a compatible object
            const matchingWorker = workerData.find(worker => 
              worker.id === passenger.id || 
              worker.workerEmployeeId === passenger.workerEmployeeId ||
              worker.employeeName === passenger.employeeName
            );

            if (matchingWorker) {
              return matchingWorker;
            } else {
              // If no exact match, create a compatible object from the passenger data
              return {
                id: passenger.id || passenger.workerEmployeeId,
                workerEmployeeId: passenger.workerEmployeeId || passenger.id,
                employeeName: passenger.employeeName || `Passenger ${passenger.id}`,
                employeeCode: passenger.employeeCode || `EMP${passenger.id}`,
                department: passenger.department || 'General'
              };
            }
          });

          setSelectedPassengers(mappedPassengers);
        }
      } catch (error) {
        console.error('❌ Error reading passenger data from form:', error);
      }
    };

    // Check immediately
    checkAndSetPassengers();

    // Set up periodic checks to catch autofilled values
    const intervals = [
      setTimeout(checkAndSetPassengers, 300),
      setTimeout(checkAndSetPassengers, 800),
      setTimeout(checkAndSetPassengers, 1500),
      setTimeout(checkAndSetPassengers, 2500),
      setTimeout(checkAndSetPassengers, 4000)
    ];

    return () => {
      intervals.forEach(clearTimeout);
    };
  }, [form]);

  const handleSelectAll = () => {
    const allPassengers = [...workerData];
    setSelectedPassengers(allPassengers);
    // Directly set form value
    form.setFieldsValue({ passengers: allPassengers });
  };

  const handleClearAll = () => {
    setSelectedPassengers([]);
    // Directly set form value
    form.setFieldsValue({ passengers: [] });
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleSelectWorker = (worker, checked) => {
    let updatedPassengers;
    if (checked) {
      updatedPassengers = [...selectedPassengers, worker];
    } else {
      updatedPassengers = selectedPassengers.filter(p => p.id !== worker.id);
    }
    
    setSelectedPassengers(updatedPassengers);
    // Directly set form value
    form.setFieldsValue({ passengers: updatedPassengers });
  };

  const handleSelectAllInTable = (checked) => {
    let updatedPassengers;
    if (checked) {
      // Add all filtered workers that are not already selected
      const newSelections = filteredWorkers.filter(worker => 
        !selectedPassengers.some(p => p.id === worker.id)
      );
      updatedPassengers = [...selectedPassengers, ...newSelections];
    } else {
      // Remove only the filtered workers from selection
      const filteredIds = filteredWorkers.map(worker => worker.id);
      updatedPassengers = selectedPassengers.filter(p => !filteredIds.includes(p.id));
    }
    
    setSelectedPassengers(updatedPassengers);
    // Directly set form value
    form.setFieldsValue({ passengers: updatedPassengers });
  };

  // Check if a worker is selected
  const isWorkerSelected = (workerId) => {
    return selectedPassengers.some(p => p.id === workerId);
  };

  // Table columns
  const columns = [
    {
      title: 'Select',
      dataIndex: 'id',
      key: 'select',
      width: 80,
      render: (id, record) => (
        <Checkbox
          checked={isWorkerSelected(id)}
          onChange={(e) => handleSelectWorker(record, e.target.checked)}
        />
      ),
    },
    {
      title: 'Employee Code',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      render: (code) => (
        <span className="font-mono text-gray-600">{code}</span>
      ),
    },
    {
      title: 'Worker Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (name) => (
        <div className="flex items-center">
          <UserOutlined className="text-gray-400 mr-2" />
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (department) => (
        <span className="text-gray-600">{department}</span>
      ),
    },
  ];

  return (
    <div className="mb-8">
      <div className="text-lg font-semibold text-gray-800 mb-4">PASSENGER ASSIGNMENT</div>
      <div className="border-l-4 border-purple-500 pl-4">
        {/* Remove the Form.Item wrapper and manage validation differently */}
        <div className="space-y-4">
          {/* Search Box */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Search Worker Name / Department</div>
            <Input
              placeholder="Search by name or department"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={handleSearch}
              size="large"
              allowClear
              style={{ marginBottom: '16px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-4">
            <Button 
              type="default" 
              size="middle" 
              icon={<CheckOutlined />}
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button 
              type="default" 
              size="middle" 
              icon={<CloseOutlined />}
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>

          {/* Workers Table */}
          <div className="border border-gray-200 rounded-lg">
            <Table
              columns={columns}
              dataSource={filteredWorkers}
              rowKey="id"
              pagination={false}
              scroll={{ y: 300 }}
              size="middle"
              rowClassName="hover:bg-gray-50"
              title={() => (
                <div className="flex justify-between items-center p-2 bg-gray-50">
                  <span className="font-medium text-gray-700">
                    Workers List ({filteredWorkers.length} found)
                    {selectedPassengers.length > 0 && ` - ${selectedPassengers.length} selected`}
                  </span>
                  <Checkbox
                    onChange={(e) => handleSelectAllInTable(e.target.checked)}
                    checked={
                      filteredWorkers.length > 0 && 
                      filteredWorkers.every(worker => isWorkerSelected(worker.id))
                    }
                    indeterminate={
                      filteredWorkers.some(worker => isWorkerSelected(worker.id)) &&
                      !filteredWorkers.every(worker => isWorkerSelected(worker.id))
                    }
                  >
                    Select All
                  </Checkbox>
                </div>
              )}
            />
          </div>

          {/* Selected Count */}
          {selectedPassengers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm font-medium text-blue-700">
                {selectedPassengers.length} worker(s) selected for transport
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Selected: {selectedPassengers.map(p => p.employeeName).join(', ')}
              </div>
            </div>
          )}

          {/* Hidden form field to store the data */}
          <Form.Item
            name="passengers"
            rules={[
              { 
                required: true, 
                message: 'Please select at least one passenger' 
              }
            ]}
            style={{ display: 'none' }} // Hide the form item but keep validation
          >
            <Input type="hidden" />
          </Form.Item>
        </div>
      </div>
    </div>
  );
};

export default PassengerAssignment;
import React from "react";
import { Row, Col, Form, Select, DatePicker, Button, message, Card } from "antd";
import { saveStatus, saveTimeline } from "../api/projectApi";
import moment from "moment";

export default function StatusTimeline({ projectId, formData, setFormData }) {
  const status = formData.status || {};

  // Helper function to convert date string to moment object
  const parseDate = (dateString) => {
    if (!dateString) return null;
    if (moment.isMoment(dateString)) return dateString;
    return moment(dateString);
  };

  // Initialize form values with moment objects
  const formValues = {
    projectStatus: status.projectStatus || undefined,
    startDate: parseDate(status.startDate),
    expectedEndDate: parseDate(status.expectedEndDate),
    actualCompletion: parseDate(status.actualCompletion),
  };

  const handleSave = async () => {
    if (!projectId) return message.error("Save Basic Info first!");
    
    try {
      // 1. Save Status
      const statusData = {
        projectStatus: formValues.projectStatus
      };
      
      console.log('Saving status:', statusData);
      await saveStatus(projectId, statusData);
      
      // 2. Save Timeline
      const timelineData = {
        startDate: formValues.startDate ? formValues.startDate.toISOString() : null,
        expectedEndDate: formValues.expectedEndDate ? formValues.expectedEndDate.toISOString() : null,
        actualCompletion: formValues.actualCompletion ? formValues.actualCompletion.toISOString() : null
      };
      
      console.log('Saving timeline:', timelineData);
      const response = await saveTimeline(projectId, timelineData);
      
      console.log('Full response:', response.data);
      message.success("Status & Timeline saved successfully!");
      
      // Update form with response data (converting to moment objects)
      if (response.data.data) {
        const updatedData = response.data.data;
        setFormData(prev => ({
          ...prev,
          status: {
            ...prev.status,
            projectStatus: updatedData.projectStatus || formValues.projectStatus,
            startDate: updatedData.startDate ? moment(updatedData.startDate) : formValues.startDate,
            expectedEndDate: updatedData.expectedEndDate ? moment(updatedData.expectedEndDate) : formValues.expectedEndDate,
            actualCompletion: updatedData.actualCompletion || updatedData.actualEndDate ? 
              moment(updatedData.actualCompletion || updatedData.actualEndDate) : 
              formValues.actualCompletion
          }
        }));
      }
      
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      message.error("Failed to save data. Check console for details.");
    }
  };

  // Form change handler
  const handleFormChange = (changedValues, allValues) => {
    setFormData(prev => ({
      ...prev,
      status: {
        ...prev.status,
        ...allValues
      }
    }));
  };

  return (
    <Card title="Status & Timeline">
      <Form 
        layout="vertical" 
        initialValues={formValues}
        onValuesChange={handleFormChange}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Project Status" name="projectStatus">
              <Select placeholder="Select project status">
                <Select.Option value="not started">Not Started</Select.Option>
                <Select.Option value="ongoing">Ongoing</Select.Option>
                <Select.Option value="on hold">On Hold</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="warranty">Warranty</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Start Date" name="startDate">
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD"
                placeholder="Select start date"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Expected End Date" name="expectedEndDate">
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD"
                placeholder="Select expected end date"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Actual Completion" name="actualCompletion">
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD"
                placeholder="Select actual completion date"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" className="mt-6">
          <Button type="primary" onClick={handleSave}>
            Save Status & Timeline
          </Button>
        </Row>
      </Form>
    </Card>
  );
}
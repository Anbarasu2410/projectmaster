import React, { useState, useEffect } from "react";
import { Row, Col, Form, Input, Select, Button, message } from "antd";
import axios from "axios";
import { createProject, updateProject } from "../api/projectApi";

export default function BasicInfo({ formData, setFormData, projectId, setProjectId }) {
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const API_URL = process.env.REACT_APP_URL;
        const res = await axios.get(`${API_URL}/companies`);
        setCompanies(res.data.data);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const API_URL = process.env.REACT_APP_URL;
        const res = await axios.get(`${API_URL}/master/clients`);
        setClients(res.data);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();
  }, []);

  const updateField = (key, value) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [key]: value
      }
    }));
  };

  const saveProject = async () => {
    try {
      let res;
      if (!projectId) {
        res = await createProject(formData.basicInfo);
        if (!res.data || !res.data.projectId) {
          message.error("Create API returned invalid data");
          return;
        }
        setProjectId(res.data.projectId);
        message.success("Project created!");
        return;
      }

      await updateProject(projectId, formData.basicInfo);
      message.success("Project updated!");
    } catch (err) {
      console.error(err);
      message.error("Error saving project");
    }
  };

  return (
    <>
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Project Name">
              <Input
                value={formData.basicInfo.projectName || ""}
                onChange={e => updateField("projectName", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Project Code">
              <Input
                value={formData.basicInfo.projectCode || ""}
                onChange={e => updateField("projectCode", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Company">
              <Select
                value={formData.basicInfo.companyId || ""}
                onChange={v => updateField("companyId", v)}
                placeholder="Select a company"
              >
                {companies.map(company => (
                  <Select.Option key={company.id} value={company.id}>
                    {company.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Client">
              <Select
                value={formData.basicInfo.clientId || ""}
                onChange={v => updateField("clientId", v)}
                placeholder="Select a client"
              >
                {clients.map(client => (
                  <Select.Option key={client.id} value={client.id}>
                    {client.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Project Type">
              <Select
                value={formData.basicInfo.projectType || ""}
                onChange={v => updateField("projectType", v)}
                placeholder="Select project type"
              >
                <Select.Option value="plumbing">Plumbing</Select.Option>
                <Select.Option value="painting">Painting</Select.Option>
                <Select.Option value="cleaning">Cleaning</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Button type="primary" onClick={saveProject}>
        Save Project
      </Button>
    </>
  );
}

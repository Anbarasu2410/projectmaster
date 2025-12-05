import React from "react";
import { Row, Col, Form, Input, Button, InputNumber, message } from "antd";
import { saveLocation } from "../api/projectApi";

export default function Location({ projectId, formData, setFormData }) {

  const updateField = (key, val) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [key]: val
      }
    }));
  };

  const submitLocation = async () => {
    if (!projectId) return message.error("Save Basic Info first!");

    await saveLocation(projectId, formData.location);
    message.success("Location saved");
  };

  return (
    <div>
      <Row gutter={16}>

        <Col span={8}>
          <Form layout="vertical">

            <Form.Item label="Latitude">
              <Input
                onChange={(e) => updateField("latitude", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Longitude">
              <Input
                onChange={(e) => updateField("longitude", e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Geo Radius (meters)">
              <InputNumber
                className="w-full"
                onChange={(v) => updateField("geofenceRadius", v)}
              />
            </Form.Item>

            <Button type="primary" onClick={submitLocation}>
              Save Location
            </Button>

          </Form>
        </Col>

        <Col span={16}>
          <div className="border h-72 rounded bg-gray-100 flex items-center justify-center">
            Map Preview Coming Soon
          </div>
        </Col>

      </Row>
    </div>
  );
}

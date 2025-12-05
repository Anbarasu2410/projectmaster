import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, InputNumber, Select, DatePicker, message } from "antd";
import { getTools } from "../api/masterDataApi";
import { saveTools } from "../api/projectApi";

export default function Tools({ projectId, formData, setFormData }) {
  const [tools, setTools] = useState([]);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({});

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    const res = await getTools();
    setTools(res.data || []);
  };

  const addTool = () => {
    setFormData(prev => ({
      ...prev,
      tools: [...(prev.tools || []), { ...item, id: Date.now() }]
    }));
    setOpen(false);
    setItem({});
  };

  const removeRow = (id) => {
    setFormData(prev => ({
      ...prev,
      tools: (prev.tools || []).filter(t => t.id !== id)
    }));
  };

  const saveData = async () => {
    if (!projectId) return message.error("Save Basic Info first!");
    await saveTools(projectId, formData.tools || []);
    message.success("Tools & Machinery saved");
  };

  const columns = [
    { title: "Tool / Machine", dataIndex: "toolName" },
    { title: "Qty", dataIndex: "qty" },
    { title: "Rental Start", dataIndex: "rentalStart" },
    { title: "Rental End", dataIndex: "rentalEnd" },
    {
      title: "Actions",
      render: (_, rec) => (
        <Button danger onClick={() => removeRow(rec.id)}>Delete</Button>
      )
    }
  ];

  return (
    <>
      <Button type="dashed" className="mb-4" onClick={() => setOpen(true)}>
        + Add Tool
      </Button>

      <Table
        columns={columns}
        dataSource={formData.tools || []}
        rowKey="id"
      />

      <Button type="primary" className="mt-4" onClick={saveData}>
        Save Tools
      </Button>

      <Modal
        title="Add Tool / Machine"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={addTool}
      >
        <Form layout="vertical">

          <Form.Item label="Tool / Machine">
            <Select
              onChange={(v, o) =>
                setItem({
                  ...item,
                  toolId: v,
                  toolName: o.children
                })
              }
            >
              {tools.map(t => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Quantity">
            <InputNumber
              className="w-full"
              onChange={(v) => setItem({ ...item, qty: v })}
            />
          </Form.Item>

          <Form.Item label="Rental Start">
            <DatePicker
              className="w-full"
              onChange={(d) => setItem({ ...item, rentalStart: d })}
            />
          </Form.Item>

          <Form.Item label="Rental End">
            <DatePicker
              className="w-full"
              onChange={(d) => setItem({ ...item, rentalEnd: d })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
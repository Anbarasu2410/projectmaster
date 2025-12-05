import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form, InputNumber, Select, DatePicker, message } from "antd";
import { getMaterials } from "../api/masterDataApi";
import { saveMaterials } from "../api/projectApi";

export default function Materials({ projectId, formData, setFormData }) {
  const [materials, setMaterials] = useState([]);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState({});

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setMaterials((await getMaterials()).data);
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { ...item, id: Date.now() }]
    }));
    setOpen(false);
    setItem({});
  };

  const removeRow = (id) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id)
    }));
  };

  const saveData = async () => {
    if (!projectId) return message.error("Save Basic Info first!");

    await saveMaterials(projectId, formData.materials);
    message.success("Materials saved");
  };

  const columns = [
    { title: "Material", dataIndex: "materialName" },
    { title: "Unit", dataIndex: "unit" },
    { title: "Quantity", dataIndex: "qty" },
    { title: "Required By", dataIndex: "date" },
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
        + Add Material
      </Button>

      <Table columns={columns} dataSource={formData.materials} rowKey="id" />

      <Button type="primary" className="mt-4" onClick={saveData}>
        Save Materials
      </Button>

      {/* Modal */}
      <Modal
        title="Add Material"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={addMaterial}
      >
        <Form layout="vertical">

          <Form.Item label="Material">
            <Select
              onChange={(v, o) =>
                setItem({
                  ...item,
                  materialId: v,
                  materialName: o.children,
                })
              }
            >
              {materials.map(m => (
                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Unit">
            <Select onChange={(v) => setItem({ ...item, unit: v })}>
              <Select.Option value="kg">KG</Select.Option>
              <Select.Option value="ltr">Litre</Select.Option>
              <Select.Option value="pcs">Pieces</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Estimated Qty">
            <InputNumber className="w-full"
              onChange={(v) => setItem({ ...item, qty: v })}
            />
          </Form.Item>

          <Form.Item label="Required By">
            <DatePicker className="w-full"
              onChange={(d) => setItem({ ...item, date: d })}
            />
          </Form.Item>

        </Form>
      </Modal>
    </>
  );
}


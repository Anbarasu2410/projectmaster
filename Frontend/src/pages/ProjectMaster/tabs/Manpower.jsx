import React, { useEffect, useState } from "react";
import { Button, Table, Form, Modal, InputNumber, Select,Input, message } from "antd";
import { saveManpower } from "../api/projectApi";
import { getTrades } from "../api/masterDataApi";

export default function Manpower({ projectId, formData, setFormData }) {
 // const [trades, setTrades] = useState([]);
  const [open, setOpen] = useState(false);
  const [manpowerItem, setManpowerItem] = useState({});

//   useEffect(() => {
//     loadTrades();
//   }, []);

//   const loadTrades = async () => {
//   try {
//     const res = await getTrades(); // GET /api/trades
//     setTrades(res.data);
//   } catch (err) {
//     console.error("Failed to load trades:", err);
//     message.error("Failed to load trades");
//   }
// };


  const addManpower = () => {
    setFormData(prev => ({
      ...prev,
      manpower: [...prev.manpower, { ...manpowerItem, id: Date.now() }]
    }));
    setOpen(false);
    setManpowerItem({});
  };

  const removeRow = (id) => {
    setFormData(prev => ({
      ...prev,
      manpower: prev.manpower.filter(item => item.id !== id)
    }));
  };

  const saveData = async () => {
    if (!projectId) return message.error("Save Basic Info first!");

    await saveManpower(projectId, formData.manpower);
    message.success("Manpower saved");
  };

  const columns = [
    { title: "Trade", dataIndex: "tradeName" },
    { title: "Required", dataIndex: "required" },
    { title: "Buffer", dataIndex: "buffer" },
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
        + Add Trade Requirement
      </Button>

      <Table dataSource={formData.manpower} columns={columns} rowKey="id" />

      <Button type="primary" className="mt-4" onClick={saveData}>
        Save Manpower
      </Button>

      {/* Add Modal */}
      <Modal
        title="Add Manpower Requirement"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={addManpower}
      >
        <Form layout="vertical">
         <Form.Item label="Trade">
  <Input
    placeholder="Enter trade name"
    value={manpowerItem.tradeName || ""}
    onChange={(e) =>
      setManpowerItem({ ...manpowerItem, tradeName: e.target.value })
    }
  />
</Form.Item>


          <Form.Item label="Required Workers">
            <InputNumber className="w-full"
              onChange={(v) =>
                setManpowerItem({ ...manpowerItem, required: v })
              }
            />
          </Form.Item>

          <Form.Item label="Buffer">
            <InputNumber className="w-full"
              onChange={(v) =>
                setManpowerItem({ ...manpowerItem, buffer: v })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}


import React from "react";
import { Upload, Table, Button, message } from "antd";
import { uploadDocument } from "../api/projectApi";


const { Dragger } = Upload;

export default function Documents({ projectId, formData, setFormData }) {

  const handleUpload = async ({ file, onSuccess, onError }) => {
    if (!projectId) {
      message.error("Save Basic Info first before uploading documents!");
      onError("No projectId");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await uploadDocument(projectId, formDataUpload);
      const docMeta = res.data; // expect { id, name, type, uploadedBy, uploadedAt } etc.

      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), docMeta]
      }));

      message.success(`${file.name} uploaded successfully`);
      onSuccess("ok");
    } catch (err) {
      console.error(err);
      message.error(`${file.name} upload failed`);
      onError(err);
    }
  };

  const columns = [
    { title: "File Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type" },
    { title: "Uploaded By", dataIndex: "uploadedBy" },
    { title: "Uploaded At", dataIndex: "uploadedAt" },
    {
      title: "Actions",
      render: (_, rec) => (
        <Button
          danger
          size="small"
          onClick={() =>
            setFormData(prev => ({
              ...prev,
              documents: (prev.documents || []).filter(d => d.id !== rec.id)
            }))
          }
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <div>
      <Dragger
        multiple
        customRequest={handleUpload}
      >
        <p className="ant-upload-drag-icon">📄</p>
        <p className="ant-upload-text">Click or drag files to upload project documents</p>
      </Dragger>

      <Table
        className="mt-4"
        columns={columns}
        dataSource={formData.documents || []}
        rowKey="id"
      />
    </div>
  );
}

// src/pages/MarksheetForm.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../bd/db';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const MarksheetForm = () => {
  const { schemaId } = useParams();
  const [schemaData, setSchemaData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (schemaId) {
      db.marksheetSchemas.get(Number(schemaId)).then(setSchemaData);
    }
  }, [schemaId]);

  const handleSubmit = async ({ formData }: any) => {
    if (!schemaData) return;

    const studentId = await db.students.add({
      classId: schemaData.classId,
      marksheetSchemaId: Number(schemaId),
      studentInfo: formData,
      marks: {}, // You can separate marks if needed
    });

    setFormData(formData);
  };


  if (!schemaData) return <div className="p-4">Loading schema...</div>;
  const cleanedUiSchema = { ...schemaData.uiSchemaJson };

  Object.entries(schemaData.schemaJson?.properties || {}).forEach(([key, def]: any) => {
    const type = def.type;
    const widget = cleanedUiSchema?.[key]?.['ui:widget'];

    const validWidgets = {
      string: ['text', 'textarea', 'password'],
      number: ['updown', 'range'],
      boolean: ['checkbox', 'radio'],
    };

    if (widget && !validWidgets[type]?.includes(widget)) {
      delete cleanedUiSchema[key]['ui:widget']; // fallback to default
    }
  });


  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Enter Student Info - {schemaData.name}</h1>

      {!formData ? (
        <Form
          schema={schemaData.schemaJson}
          uiSchema={cleanedUiSchema}
          validator={validator}
          onSubmit={handleSubmit}
        />

      ) : (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Marksheet Preview</h2>
          <div className="border p-4 bg-white rounded shadow w-full max-w-md">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="mb-2">
                <strong>{key}</strong>: {String(value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksheetForm;

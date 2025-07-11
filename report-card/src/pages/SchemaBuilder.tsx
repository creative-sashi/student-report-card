import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { db } from '../bd/db';


const fieldTypes = ['string', 'number', 'boolean'] as const;
const widgetOptions = ['text', 'updown', 'checkbox'] as const;

interface FieldDef {
  key: string;
  label: string;
  type: typeof fieldTypes[number];
  required: boolean;
  widget?: string;
}

interface SchemaFormValues {
  name: string;
  fields: FieldDef[];
}

export default function SchemaBuilder({ classId, onSaved }: { classId: number; onSaved?: () => void }) {
  const initialValues: SchemaFormValues = {
    name: '',
    fields: [],
  };

  const handleSave = async (values: SchemaFormValues) => {
    const schemaJson: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    const uiSchemaJson: any = {};

    for (const field of values.fields) {
      schemaJson.properties[field.key] = { type: field.type };
      if (field.required) schemaJson.required.push(field.key);
      if (field.widget) uiSchemaJson[field.key] = { 'ui:widget': field.widget };
    }

    if (schemaJson.required.length === 0) delete schemaJson.required;

    await db.marksheetSchemas.add({
      classId,
      name: values.name,
      schemaJson,
      uiSchemaJson,
    });

    onSaved?.();
  };

  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-4">Create New Marksheet Schema</h2>

      <Formik initialValues={initialValues} onSubmit={handleSave}>
        {({ values }) => (
          <Form className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Schema Name</label>
              <Field name="name" type="text" className="border px-3 py-2 w-full rounded" required />
            </div>

            <FieldArray name="fields">
              {({ push, remove }) => (
                <div className="space-y-4">
                  {values.fields.map((field, index) => (
                    <div key={index} className="border rounded p-3 space-y-2 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm">Field Key</label>
                          <Field name={`fields[${index}].key`} type="text" required className="border px-2 py-1 w-full rounded" />
                        </div>
                        <div>
                          <label className="block text-sm">Label</label>
                          <Field name={`fields[${index}].label`} type="text" required className="border px-2 py-1 w-full rounded" />
                        </div>
                        <div>
                          <label className="block text-sm">Type</label>
                          <Field as="select" name={`fields[${index}].type`} className="border px-2 py-1 w-full rounded">
                            {fieldTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </Field>
                        </div>
                        <div>
                          <label className="block text-sm">Widget</label>
                          <Field as="select" name={`fields[${index}].widget`} className="border px-2 py-1 w-full rounded">
                            <option value="">(auto)</option>
                            {widgetOptions.map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </Field>
                        </div>
                        <div className="col-span-2">
                          <label className="inline-flex items-center space-x-2">
                            <Field type="checkbox" name={`fields[${index}].required`} />
                            <span>Required</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-red-500 text-sm mt-2"
                        onClick={() => remove(index)}
                      >
                        Remove Field
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => push({ key: '', label: '', type: 'string', required: false })}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    + Add Field
                  </button>
                </div>
              )}
            </FieldArray>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Schema
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

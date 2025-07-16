import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { db } from '../bd/db';
import * as Yup from 'yup';

interface FieldSchema {
  label: string;
  fieldKey: string;
  type: string;
  required: boolean;
}

interface SubjectSchema {
  subjectName: string;
  maxMarks: number;
}

interface ExamSchema {
  term: string;
  subjects: SubjectSchema[];
}

interface MarksheetSchema {
  id?: number;
  name: string;
  classId: number;
  schemaJson: {
    header: string;
    footer: string;
    fields: FieldSchema[];
    exams: ExamSchema[];
  };
}

interface FormValues {
  [key: string]: string | number;
}

const MarksheetForm = () => {
  const { schemaId } = useParams<{ schemaId: string }>();
  const [schema, setSchema] = useState<MarksheetSchema | null>(null);

  useEffect(() => {
    if (schemaId) {
      db.marksheetSchemas.get(Number(schemaId)).then((result) => setSchema(result ?? null));
    }
  }, [schemaId]);

  if (!schema) return <div className="p-6 text-gray-600">Loading schema...</div>;

  const initialValues: FormValues = {
    ...schema.schemaJson.fields.reduce((acc, field) => {
      acc[field.fieldKey] = '';
      return acc;
    }, {} as FormValues),
    ...schema.schemaJson.exams.reduce((acc, exam) => {
      exam.subjects.forEach((sub) => {
        acc[`marks_${exam.term}_${sub.subjectName}`] = '';
      });
      return acc;
    }, {} as FormValues)
  };

  const validationSchema = Yup.object(
    schema.schemaJson.fields.reduce((acc, field) => {
      if (field.required) {
        acc[field.fieldKey] = Yup.string().required(`${field.label} is required`);
      } else {
        acc[field.fieldKey] = Yup.string();
      }
      return acc;
    }, {} as Record<string, Yup.StringSchema>)
  );

  const handleSubmit = (values: FormValues) => {
    console.log('Submitted Values:', values);
    // TODO: Save student data to IDB & render preview
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        📝 {schema.schemaJson.header || schema.name}
      </h1>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="space-y-10">
          <div className="grid gap-6 sm:grid-cols-2">
            {schema.schemaJson.fields.map((field) => (
              <div key={field.fieldKey}>
                <label className="block font-medium text-sm text-slate-700 mb-1">
                  {field.label}
                </label>
                <Field
                  type={field.type === 'date' ? 'date' : field.type}
                  name={field.fieldKey}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <ErrorMessage
                  name={field.fieldKey}
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            ))}
          </div>

          <div className="space-y-10">
            {schema.schemaJson.exams.map((exam, examIdx) => (
              <div key={examIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h2 className="text-lg font-semibold text-blue-800 mb-4">
                  📘 {exam.term} Examination
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {exam.subjects.map((subject, idx) => (
                    <div key={idx}>
                      <label className="block font-medium text-sm text-slate-700 mb-1">
                        {subject.subjectName} (Max: {subject.maxMarks})
                      </label>
                      <Field
                        type="number"
                        name={`marks_${exam.term}_${subject.subjectName}`}
                        className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md shadow-sm text-sm"
            >
              💾 Save & Preview
            </button>
          </div>
        </Form>
      </Formik>

      {schema.schemaJson.footer && (
        <div className="mt-10 text-slate-500 italic text-sm">
          {schema.schemaJson.footer}
        </div>
      )}
    </div>
  );
};

export default MarksheetForm;
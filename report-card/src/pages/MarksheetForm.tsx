import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { db } from '../bd/db';

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

const sanitizeKey = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, '_');

type MarksheetFormProps = {
  onCreated: (newEntry: any) => void;
  onCancel: () => void
};

const MarksheetForm = ({ onCreated, onCancel }: MarksheetFormProps) => {
  const { schemaId } = useParams<{ schemaId: string }>();
  const [schema, setSchema] = useState<MarksheetSchema | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

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
        const key = `marks_${sanitizeKey(exam.term)}_${sanitizeKey(sub.subjectName)}`;
        acc[key] = '';
      });
      return acc;
    }, {} as FormValues)
  };

  const validationSchema = Yup.object().shape({
    ...Object.fromEntries(
      schema.schemaJson.fields.filter(f => f.required).map((field: any) => [
        field.fieldKey,
        Yup.string().required(`${field.label} is required`)
      ])
    ),
    ...Object.fromEntries(
      schema.schemaJson.exams.flatMap((exam: any) =>
        exam.subjects.map((subject: any) => [
          `marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`,
          Yup.number()
            .typeError('Must be a number')
            .required('Required')
            .min(0, 'Min 0')
            .max(subject.maxMarks, `Max ${subject.maxMarks}`),
        ])
      )
    )
  });

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const studentFields = schema.schemaJson.fields.reduce((acc, field) => {
        acc[field.fieldKey] = values[field.fieldKey];
        return acc;
      }, {} as any);

      const studentPayload = {
        classId: schema.classId,
        ...studentFields,
        createdAt: new Date(),
      };

      const studentId = await db.students.add(studentPayload);

      const marksEntries: { [key: string]: number } = {};
      let totalMarks = 0;
      let obtainedMarks = 0;

      schema.schemaJson.exams.forEach((exam: any) => {
        exam.subjects.forEach((subject: any) => {
          const key = `marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`;
          const mark = Number(values[key]);

          if (!isNaN(mark)) {
            marksEntries[key] = mark;
            obtainedMarks += mark;
          }

          totalMarks += subject.maxMarks;
        });
      });

      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

      const newMarkId = await db.marks.add({
        studentId: studentId,
        schemaId: Number(schemaId),
        entries: marksEntries,
        total: obtainedMarks,
        percentage: Number(percentage.toFixed(2)),
        createdAt: new Date(),
      });

      onCreated({
        id: newMarkId,
        percentage: Number(percentage.toFixed(2)),
        student: { ...studentPayload, id: studentId },
        ...marksEntries,
      });

      setMessage('✅ Submission successful!');
      setIsError(false);
      resetForm();

    } catch (error) {
      console.error("❌ Submission failed", error);
      setMessage('❌ Submission failed. Please try again later.');
      setIsError(true);
    }
  };

  return (
    <div className="font-sans py-8 px-6 max-w-full h-[80vh] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .font-sans {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      {/* Static Header Section */}
      <div className="border-b-2 border-gray-200 pb-6 mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          📝 {schema.schemaJson.header || schema.name}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Fill out the form below to create a new marksheet entry.
        </p>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-xl font-medium ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values }) => {
          useEffect(() => {
            let obtained = 0;
            let total = 0;

            schema.schemaJson.exams.forEach((exam) => {
              exam.subjects.forEach((subject) => {
                const key = `marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`;
                const val = Number(values[key]);
                if (!isNaN(val)) {
                  obtained += val;
                }
                total += subject.maxMarks;
              });
            });

            if (total > 0) {
              const pct = (obtained / total) * 100;
              setPercentage(parseFloat(pct.toFixed(2)));
            } else {
              setPercentage(null);
            }
          }, [values, schema]);

          return (
            <Form className="flex flex-col flex-1 space-y-8 overflow-auto overflow-x-hidden">
              {/* Scrollable Form Content */}
              <div className="space-y-8 p-1 -m-1">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-semibold text-teal-700 mb-4">Student Information</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {schema.schemaJson.fields.map((field) => (
                      <div key={field.fieldKey}>
                        <label className="block font-medium text-sm text-slate-700 mb-1">
                          {field.label}
                        </label>
                        <Field
                          type={field.type === 'date' ? 'date' : field.type}
                          name={field.fieldKey}
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-colors"
                        />
                        <ErrorMessage
                          name={field.fieldKey}
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-semibold text-teal-700 mb-4">Marks Entry</h3>
                  <div className="space-y-6">
                    {schema.schemaJson.exams.map((exam, examIdx) => (
                      <div key={examIdx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-lg font-semibold text-blue-800 mb-4">
                          📘 {exam.term} Examination
                        </h4>
                        <div className="grid gap-6 sm:grid-cols-2">
                          {exam.subjects.map((subject, idx) => (
                            <div key={idx}>
                              <label className="block font-medium text-sm text-slate-700 mb-1">
                                {subject.subjectName} (Max: {subject.maxMarks})
                              </label>
                              <Field
                                type="number"
                                name={`marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`}
                                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-colors"
                              />
                              <ErrorMessage
                                name={`marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`}
                                component="div"
                                className="text-red-500 text-sm mt-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Static Footer Section */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 flex-shrink-0">
                {percentage !== null && (
                  <div className="text-center bg-blue-100 text-blue-700 font-bold text-lg p-4 rounded-xl mb-4">
                    📊 Overall Percentage: {percentage}%
                  </div>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-full shadow transition-colors"
                    onClick={onCancel}
                  >
                    ❌ Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-md transition-colors"
                  >
                    💾 Save & Preview
                  </button>
                </div>
                {schema.schemaJson.footer && (
                  <div className="mt-4 text-center text-slate-500 italic text-sm">
                    {schema.schemaJson.footer}
                  </div>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default MarksheetForm;

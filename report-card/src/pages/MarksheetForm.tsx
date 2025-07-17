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

// sanitize the field keys to be valid JS identifiers
// e.g. "Mid Term" → "Mid_Term", "Final Exam" →
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

  const validationSchema = Yup.object().shape(
    Object.fromEntries(
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
  );


  const handleSubmit = async (values: any) => {
    try {
      // 1. Extract student details
      const studentPayload = {
        classId: schema.classId,
        name: values.name,
        fatherName: values.fatherName,
        dob: values.dob,
        class: values.class,
        rollNo: values.rollNo,
        createdAt: new Date(),
      };

      // 2. Save student → get `studentId`
      const studentId = await db.students.add(studentPayload);

      // 3. Extract marks & calculate percentage
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

      // 4. Save marks
      await db.marks.add({
        studentId: studentId,
        schemaId: Number(schemaId),
        entries: marksEntries,
        total: obtainedMarks,
        percentage: Number(percentage.toFixed(2)),
        createdAt: new Date(),
      });


      // 5. Optionally redirect or reset form here

      onCreated({
        id: studentId,
        percentage: Number(percentage.toFixed(2)),
        student: { ...studentPayload, id: studentId },
        ...marksEntries,
      });

      alert('✅ Submission successful!');

    } catch (error) {
      console.error("❌ Submission failed", error);
      alert('❌ Submission failed. Please try again later.');
    }
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
          }, [values]);

          return (
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
                            name={`marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {percentage !== null && (
                <div className="text-right text-blue-700 font-medium text-sm mb-2">
                  📊 Current Total: {percentage}% achieved
                </div>
              )}

              <div className="text-right">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                  onClick={onCancel}
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md shadow-sm text-sm"
                >
                  💾 Save & Preview
                </button>
              </div>
            </Form>
          );
        }}
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
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../bd/db";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Field {
  label: string;
  fieldKey: string;
  type: "string" | "number" | "date";
  required: boolean;
}

interface Subject {
  subjectName: string;
  maxMarks: number;
}

interface Exam {
  term: string;
  subjects: Subject[];
}

interface SchemaFormValues {
  schemaName: string;
  header: string;
  footer: string;
  fields: Field[];
  exams: Exam[];
}

const SchemaBuilder = () => {
  const { classId, schoolId } = useParams<{ classId: string; schoolId: string }>();
  const [savedSchemas, setSavedSchemas] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (classId) {
      db.marksheetSchemas.where("classId").equals(Number(classId)).toArray().then(setSavedSchemas);
    }
  }, [classId]);

  const formik = useFormik<SchemaFormValues>({
    initialValues: {
      schemaName: "",
      header: "",
      footer: "",
      fields: [],
      exams: [],
    },
    validationSchema: Yup.object({
      schemaName: Yup.string().required("Schema name is required"),
      header: Yup.string().required("Header is required"),
    }),
    onSubmit: async (values) => {
      if (!classId) return;

      await db.marksheetSchemas.add({
        classId: Number(classId),
        name: values.schemaName,
        schemaJson: values,
      });

      formik.resetForm();
      const updated = await db.marksheetSchemas.where("classId").equals(Number(classId)).toArray();
      setSavedSchemas(updated);
    },
  });

  const addField = () => {
    formik.setFieldValue("fields", [
      ...formik.values.fields,
      { label: "", fieldKey: "", type: "string", required: false },
    ]);
  };

  const addExam = () => {
    formik.setFieldValue("exams", [
      ...formik.values.exams,
      { term: "", subjects: [] },
    ]);
  };

  const removeField = (index: number) => {
    const updated = [...formik.values.fields];
    updated.splice(index, 1);
    formik.setFieldValue("fields", updated);
  };

  const removeExam = (index: number) => {
    const updated = [...formik.values.exams];
    updated.splice(index, 1);
    formik.setFieldValue("exams", updated);
  };

  const addSubjectToExam = (examIndex: number) => {
    const updatedExams = [...formik.values.exams];
    updatedExams[examIndex].subjects.push({ subjectName: "", maxMarks: 100 });
    formik.setFieldValue("exams", updatedExams);
  };

  const removeSubjectFromExam = (examIndex: number, subjectIndex: number) => {
    const updatedExams = [...formik.values.exams];
    updatedExams[examIndex].subjects.splice(subjectIndex, 1);
    formik.setFieldValue("exams", updatedExams);
  };

  return (
         <div>
      <div className="bg-white shadow-md border rounded-xl p-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">🛠️ Build Marksheet Schema</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Schema Name</label>
              <input
                type="text"
                name="schemaName"
                value={formik.values.schemaName}
                onChange={formik.handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Header</label>
              <input
                type="text"
                name="header"
                value={formik.values.header}
                onChange={formik.handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-blue-700">🎓 Student Info Fields</h3>
              <button type="button" onClick={addField} className="text-sm text-blue-600 hover:underline">+ Add Field</button>
            </div>
            <div className="space-y-3">
              {formik.values.fields.map((field, index) => (
                <div key={index} className="relative flex flex-col md:flex-row md:items-center md:gap-2 gap-3">
                  <input
                    type="text"
                    placeholder="Label"
                    value={field.label}
                    onChange={(e) => formik.setFieldValue(`fields[${index}].label`, e.target.value)}
                    className="border px-2 py-1 rounded w-full md:w-1/4"
                  />
                  <input
                    type="text"
                    placeholder="Field Key"
                    value={field.fieldKey}
                    onChange={(e) => formik.setFieldValue(`fields[${index}].fieldKey`, e.target.value)}
                    className="border px-2 py-1 rounded w-full md:w-1/4"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => formik.setFieldValue(`fields[${index}].type`, e.target.value)}
                    className="border px-2 py-1 rounded w-full md:w-1/4"
                  >
                    <option value="string">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <label className="flex items-center gap-1 w-full md:w-auto">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => formik.setFieldValue(`fields[${index}].required`, e.target.checked)}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="absolute right-0 top-0 md:static text-red-500 text-xl"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-green-700">📅 Exams & Subjects</h3>
              <button type="button" onClick={addExam} className="text-sm text-green-600 hover:underline">+ Add Exam</button>
            </div>
            {formik.values.exams.map((exam, examIndex) => (
              <div key={examIndex} className="relative bg-slate-50 p-4 rounded-md mb-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Term Name (e.g., Terminal)"
                    value={exam.term}
                    onChange={(e) => formik.setFieldValue(`exams[${examIndex}].term`, e.target.value)}
                    className="border px-2 py-1 rounded w-full sm:w-1/2"
                  />
                  <button
                    type="button"
                    onClick={() => removeExam(examIndex)}
                    className="absolute top-4.5 md:top-2  right-[0px] md:right-2 sm:static text-red-500 text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  {exam.subjects.map((sub, subIndex) => (
                    <div key={subIndex} className="relative flex flex-col md:flex-row md:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={sub.subjectName}
                        onChange={(e) => formik.setFieldValue(`exams[${examIndex}].subjects[${subIndex}].subjectName`, e.target.value)}
                        className="border px-2 py-1 rounded w-full md:w-1/2"
                      />
                      <input
                        type="number"
                        placeholder="Max Marks"
                        value={sub.maxMarks}
                        onChange={(e) => formik.setFieldValue(`exams[${examIndex}].subjects[${subIndex}].maxMarks`, Number(e.target.value))}
                        className="border px-2 py-1 rounded w-full md:w-1/4"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubjectFromExam(examIndex, subIndex)}
                        className="absolute md:top-2 top-1 right-[-15px] md:right-2 md:static text-red-500 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSubjectToExam(examIndex)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add Subject to {exam.term || 'Exam'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Footer</label>
            <input
              type="text"
              name="footer"
              value={formik.values.footer}
              onChange={formik.handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-sm"
            >
              💾 Save Schema
            </button>
          </div>
        </form>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-slate-800 mb-4">📁 Saved Schemas</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {savedSchemas.map((schema) => (
            <div
              key={schema.id}
              onClick={() => navigate(`/schools/${schoolId}/classes/${classId}/schemas/${schema.id}`)}
              className="bg-white p-4 border rounded-xl shadow hover:shadow-md cursor-pointer transition"
            >
              <h4 className="text-lg font-semibold text-blue-700 mb-1">{schema.name}</h4>
              <p className="text-sm text-slate-600">{schema.schemaJson.header}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;
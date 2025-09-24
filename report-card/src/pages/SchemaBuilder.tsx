import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik, type FormikErrors } from "formik";
import * as Yup from "yup";
import { db } from "../bd/db";

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

  const validationSchema = Yup.object({
    schemaName: Yup.string().required("Schema name is required"),
    header: Yup.string().required("Header is required"),
    fields: Yup.array().of(
      Yup.object().shape({
        label: Yup.string().required("Label is required"),
        fieldKey: Yup.string().required("Field key is required"),
      })
    ),
    exams: Yup.array().of(
      Yup.object().shape({
        term: Yup.string().required("Term name is required"),
        subjects: Yup.array().of(
          Yup.object().shape({
            subjectName: Yup.string().required("Subject name is required"),
            maxMarks: Yup.number().required("Max marks is required").min(1, "Must be at least 1").typeError("Must be a number"),
          })
        ),
      })
    ),
  });

  const formik = useFormik<SchemaFormValues>({
    initialValues: {
      schemaName: "",
      header: "",
      footer: "",
      fields: [],
      exams: [],
    },
    validationSchema: validationSchema,
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
    <div className="font-sans bg-gray-100 min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-sans {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
      <div className="py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
        {/* Schema Builder Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-4xl font-bold mb-8 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            <span className="text-4xl text-teal-500">🛠️</span> Marksheet Schema Builder
          </h2>
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* Schema Details */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-teal-700 mb-4">Schema Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Schema Name</label>
                  <input
                    type="text"
                    {...formik.getFieldProps('schemaName')}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  {formik.touched.schemaName && formik.errors.schemaName && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.schemaName}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Header Text</label>
                  <input
                    type="text"
                    {...formik.getFieldProps('header')}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  {formik.touched.header && formik.errors.header && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.header}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Info Fields */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-teal-700">🎓 Student Info Fields</h3>
                <button
                  type="button"
                  onClick={addField}
                  className="text-sm text-teal-600 font-semibold flex items-center gap-1 hover:text-teal-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Add Field
                </button>
              </div>
              <div className="space-y-4">
                {formik.values.fields.map((field, index) => (
                  <div key={index} className="relative flex flex-col md:flex-row items-baseline gap-4 p-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Label (e.g., Guardian Name)"
                        {...formik.getFieldProps(`fields[${index}].label`)}
                        className="border px-3 py-2 rounded-lg w-full"
                      />
                      {formik.touched.fields?.[index]?.label &&
                        typeof formik.errors.fields?.[index] === "object" &&
                        formik.errors.fields?.[index] !== null &&
                        "label" in (formik.errors.fields[index] as object) &&
                        (
                          <div className="text-red-500 text-sm mt-1">
                            {(formik.errors.fields[index] as FormikErrors<Field>).label}
                          </div>
                        )
                      }
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Field Key (e.g., guardianName)"
                        {...formik.getFieldProps(`fields[${index}].fieldKey`)}
                        className="border px-3 py-2 rounded-lg w-full"
                      />
                      {formik.touched.fields?.[index]?.fieldKey &&
                        typeof formik.errors.fields?.[index] === "object" &&
                        formik.errors.fields?.[index] !== null &&
                        "fieldKey" in (formik.errors.fields[index] as object) &&
                        (
                          <div className="text-red-500 text-sm mt-1">
                            {(formik.errors.fields[index] as FormikErrors<Field>).fieldKey}
                          </div>
                        )
                      }
                    </div>
                    <select
                      {...formik.getFieldProps(`fields[${index}].type`)}
                      className="border px-3 py-2 rounded-lg flex-1"
                    >
                      <option value="string">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                      <input
                        type="checkbox"
                        {...formik.getFieldProps(`fields[${index}].required`)}
                        className="form-checkbox text-teal-500 rounded"
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exams & Subjects */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-teal-700">📅 Exams & Subjects</h3>
                <button
                  type="button"
                  onClick={addExam}
                  className="text-sm text-teal-600 font-semibold flex items-center gap-1 hover:text-teal-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Add Exam
                </button>
              </div>
              <div className="space-y-6">
                {formik.values.exams.map((exam, examIndex) => (
                  <div key={examIndex} className="relative bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-baseline gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Term Name (e.g., Terminal)"
                          {...formik.getFieldProps(`exams[${examIndex}].term`)}
                          className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-teal-500 transition-colors"
                        />
                        {formik.touched.exams?.[examIndex]?.term &&
                          typeof formik.errors.exams?.[examIndex] === "object" &&
                          formik.errors.exams?.[examIndex] !== null &&
                          "term" in (formik.errors.exams[examIndex] as object) &&
                          (
                            <div className="text-red-500 text-sm mt-1">
                              {(formik.errors.exams[examIndex] as FormikErrors<Exam>).term}
                            </div>
                          )
                        }
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExam(examIndex)}
                        className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    <div className="space-y-3 pl-4 border-l-2 border-dashed border-gray-300">
                      {exam.subjects.map((sub, subIndex) => (
                        <div key={subIndex} className="relative flex flex-col md:flex-row items-baseline gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Subject Name (e.g., Mathematics)"
                              {...formik.getFieldProps(`exams[${examIndex}].subjects[${subIndex}].subjectName`)}
                              className="border px-3 py-2 rounded-lg w-full"
                            />
                            {formik.touched.exams?.[examIndex]?.subjects?.[subIndex]?.subjectName &&
                              typeof formik.errors.exams?.[examIndex] === "object" &&
                              formik.errors.exams?.[examIndex] !== null &&
                              "subjects" in (formik.errors.exams[examIndex] as object) &&
                              Array.isArray(formik.errors.exams?.[examIndex]?.subjects) &&
                              typeof formik.errors.exams?.[examIndex]?.subjects?.[subIndex] === "object" &&
                              formik.errors.exams?.[examIndex]?.subjects?.[subIndex] !== null &&
                              "subjectName" in (formik.errors.exams[examIndex].subjects[subIndex] as object) && (
                                <div className="text-red-500 text-sm mt-1">
                                  {(formik.errors.exams[examIndex].subjects[subIndex] as FormikErrors<Subject>).subjectName}
                                </div>
                              )
                            }
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              placeholder="Max Marks"
                              {...formik.getFieldProps(`exams[${examIndex}].subjects[${subIndex}].maxMarks`)}
                              className="border px-3 py-2 rounded-lg w-full"
                            />
                             {formik.touched.exams?.[examIndex]?.subjects?.[subIndex]?.maxMarks &&
                              typeof formik.errors.exams?.[examIndex] === "object" &&
                              formik.errors.exams?.[examIndex] !== null &&
                              "subjects" in (formik.errors.exams[examIndex] as object) &&
                              Array.isArray(formik.errors.exams?.[examIndex]?.subjects) &&
                              typeof formik.errors.exams?.[examIndex]?.subjects?.[subIndex] === "object" &&
                              formik.errors.exams?.[examIndex]?.subjects?.[subIndex] !== null &&
                              "maxMarks" in (formik.errors.exams[examIndex].subjects[subIndex] as object) &&
                              (
                                <div className="text-red-500 text-sm mt-1">
                                  {(formik.errors.exams[examIndex].subjects[subIndex] as FormikErrors<Subject>).maxMarks}
                                </div>
                              )
                            }
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSubjectFromExam(examIndex, subIndex)}
                            className=" text-red-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSubjectToExam(examIndex)}
                        className="text-sm text-teal-600 font-semibold flex items-center gap-1 hover:text-teal-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Add Subject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-teal-700 mb-4">Footer</h3>
              <label className="block text-sm font-medium text-slate-700 mb-1">Footer Text</label>
              <input
                type="text"
                {...formik.getFieldProps('footer')}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-md transition-colors"
              >
                💾 Save Schema
              </button>
            </div>
          </form>
        </div>

        {/* Saved Schemas Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mt-10">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-teal-500">📁</span> Saved Schemas
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedSchemas.map((schema) => (
              <div
                key={schema.id}
                onClick={() => navigate(`/schools/${schoolId}/classes/${classId}/schemas/${schema.id}`)}
                className="bg-gray-50 p-5 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition-transform transform hover:-translate-y-2"
              >
                <h4 className="text-xl font-semibold text-teal-700 mb-1">{schema.name}</h4>
                <p className="text-sm text-slate-600">{schema.schemaJson.header}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;

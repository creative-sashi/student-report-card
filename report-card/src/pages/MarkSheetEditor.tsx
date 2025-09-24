 import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../bd/db';

// Interfaces for data from the database
interface MarksheetSchema {
  id?: number;
  name: string;
  classId: number;
  schemaJson: {
    header: string;
    footer: string;
    fields: Array<{ label: string; fieldKey: string; type: string }>;
    exams: Array<{ term: string; subjects: Array<{ subjectName: string; maxMarks: number }> }>;
  };
}

interface Student {
  id?: number;
  name: string;
  classId: number;
  [key: string]: any;
}

interface Mark {
  id?: number;
  studentId: number;
  schemaId: number;
  entries: { [key: string]: number };
  total: number;
  percentage: number;
}

interface School {
  id?: number;
  name: string;
  address: string;
}

const sanitizeKey = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, '_');

const calculateGrade = (percentage: number) => {
  if (percentage >= 91) return "A+";
  if (percentage >= 81) return "A";
  if (percentage >= 71) return "B+";
  if (percentage >= 61) return "B";
  if (percentage >= 51) return "C";
  if (percentage >= 41) return "D";
  if (percentage >= 31) return "E";
  if (percentage >= 0) return "F";
  return "-";
};

const MarksheetEditor = () => {
  const { schoolId, classId, schemaId, studentId } = useParams<{ schoolId: string; classId: string; schemaId: string; studentId: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [schema, setSchema] = useState<MarksheetSchema | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [mark, setMark] = useState<Mark | null>(null);
  const [selectedFrame, setSelectedFrame] = useState('Professional'); // Set default to Professional
  const [customImage, setCustomImage] = useState<string | null>(null);

  const contentRef = useRef(null);
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const loadData = async () => {
      if (schoolId && classId && schemaId && studentId) {
        const loadedSchool = await db.schools.get(Number(schoolId));
        setSchool(loadedSchool || null);
        const loadedSchema = await db.marksheetSchemas.get(Number(schemaId));
        setSchema(loadedSchema || null);
        const loadedMark = await db.marks.where({ studentId: Number(studentId), schemaId: Number(schemaId) }).first();
        setMark(loadedMark || null);
        const loadedStudent = await db.students.get(Number(studentId));
        setStudent(loadedStudent || null);
      }
    };
    loadData();
  }, [schoolId, classId, schemaId, studentId]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  if (!schema || !student || !mark || !school) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-gray-500 text-lg font-medium animate-pulse">Loading marksheet data...</div>
      </div>
    );
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderMarksheet = () => {
    const renderHeader = () => (
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{schema.schemaJson.header}</h1>
        {customImage && (
          <img src={customImage} alt="School Logo" className="mx-auto my-4 h-24 w-auto object-contain" />
        )}
      </div>
    );

    const renderFooter = () => (
      <div className="mt-8 text-center text-sm italic text-gray-600 border-t border-gray-300 pt-4">
        {schema.schemaJson.footer}
      </div>
    );

    const renderStudentInfo = () => (
      <div className="grid grid-cols-2 gap-4 mb-8">
        {schema.schemaJson.fields.map((field) => (
          <div key={field.fieldKey}>
            <p className="text-sm text-gray-600 font-medium">{field.label}:</p>
            <p className="text-gray-800 font-semibold">{student[field.fieldKey]}</p>
          </div>
        ))}
      </div>
    );

    const renderMarksTable = () => (
      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        {schema.schemaJson.exams.map((exam, examIdx) => (
          <div key={examIdx} className="mb-6 last:mb-0">
            <h3 className="text-lg font-bold text-gray-700 mb-2">{exam.term} Examination</h3>
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm font-semibold">
                  <th className="px-4 py-2 rounded-tl-lg">Subject</th>
                  <th className="px-4 py-2">Max Marks</th>
                  <th className="px-4 py-2 rounded-tr-lg">Obtained Marks</th>
                </tr>
              </thead>
              <tbody>
                {exam.subjects.map((subject, subIdx) => {
                  const key = `marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`;
                  return (
                    <tr key={subIdx} className="border-t border-gray-300 text-sm hover:bg-gray-100 transition-colors">
                      <td className="px-4 py-2">{subject.subjectName}</td>
                      <td className="px-4 py-2">{subject.maxMarks}</td>
                      <td className="px-4 py-2">{mark.entries[key] ?? 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
        <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4 mt-4">
          <span className="text-lg font-bold text-blue-700">Total Percentage:</span>
          <span className={`text-xl font-extrabold ${getPercentageColor(mark.percentage)}`}>
            {mark.percentage}%
          </span>
        </div>
        <div className="text-right text-lg font-semibold mt-2">
          Grade: {calculateGrade(mark.percentage)}
        </div>
      </div>
    );

    switch (selectedFrame) {
      case 'Minimalist':
        return (
          <div className="bg-white p-10 shadow-lg rounded-2xl w-full max-w-2xl mx-auto">
            {renderHeader()}
            {renderStudentInfo()}
            {renderMarksTable()}
            {renderFooter()}
          </div>
        );
      case 'Classic':
        return (
          <div className="bg-white p-10 shadow-lg border-2 border-gray-300 rounded-lg w-full max-w-2xl mx-auto">
            {renderHeader()}
            <div className="p-6 border-2 border-dashed border-gray-400 rounded-lg">
              {renderStudentInfo()}
              {renderMarksTable()}
            </div>
            {renderFooter()}
          </div>
        );
      case 'Professional':
        return (
          <div className="relative bg-white p-12 border-4 border-gray-800 rounded-lg w-full max-w-2xl mx-auto font-serif shadow-2xl">
            {/* Watermark */}
            {customImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <img src={customImage} alt="Watermark" className="h-64 w-auto object-contain grayscale" />
              </div>
            )}
            
            <div className="relative z-10">
              <div className="border-b-4 border-gray-800 pb-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-sans">REG. NO: XXXX</div>
                  {customImage && (
                    <img src={customImage} alt="School Logo" className="h-20 w-auto object-contain" />
                  )}
                  <div className="text-xs font-sans">DISE CODE: XXXX</div>
                </div>
                <div className="text-center font-bold text-gray-900">
                  <h1 className="text-4xl uppercase">{school.name}</h1>
                  <p className="text-xl italic font-normal mt-1">
                    Annual Examination Report Card
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm font-sans mb-8">
                {schema.schemaJson.fields.map((field) => (
                  <div key={field.fieldKey} className="flex items-end border-b border-gray-400 pb-1">
                    <span className="font-semibold text-gray-700 flex-shrink-0 mr-2">{field.label}:</span>
                    <span className="flex-1 font-medium text-gray-900 truncate">{student[field.fieldKey]}</span>
                  </div>
                ))}
              </div>

              {schema.schemaJson.exams.map((exam, examIdx) => (
                <div key={examIdx} className="mb-8">
                  <h3 className="text-lg font-bold text-center border-y border-gray-700 py-2 bg-gray-100">{exam.term} Examination</h3>
                  <table className="w-full text-left table-auto border-collapse border border-gray-400">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Subject</th>
                        <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Max Marks</th>
                        <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Obtained Marks</th>
                        <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.subjects.map((subject, subIdx) => {
                        const key = `marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`;
                        const obtainedMark = mark.entries[key] ?? 'N/A';
                        return (
                          <tr key={subIdx} className="text-sm">
                            <td className="px-4 py-2 border border-gray-300">{subject.subjectName}</td>
                            <td className="px-4 py-2 border border-gray-300">{subject.maxMarks}</td>
                            <td className="px-4 py-2 border border-gray-300">{obtainedMark}</td>
                            <td className="px-4 py-2 border border-gray-300">{obtainedMark !== 'N/A' ? calculateGrade((obtainedMark / subject.maxMarks) * 100) : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
              
              <div className="flex justify-between items-center text-sm font-sans border-t-2 border-gray-800 pt-4">
                <div className="flex-1 flex flex-col items-center">
                  <span className="font-bold text-lg">{mark.percentage}%</span>
                  <span className="text-xs text-gray-600">Overall Percentage</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="font-bold text-lg">{calculateGrade(mark.percentage)}</span>
                  <span className="text-xs text-gray-600">Overall Grade</span>
                </div>
              </div>

              <div className="mt-8 text-center text-sm font-sans text-gray-600">
                {schema.schemaJson.footer}
              </div>

            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-10 shadow-lg rounded-2xl w-full max-w-2xl mx-auto">
            {renderHeader()}
            {renderStudentInfo()}
            {renderMarksTable()}
            {renderFooter()}
          </div>
        );
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gray-100 p-8 flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap');
        .font-sans {
          font-family: 'Poppins', sans-serif;
        }
        .font-serif {
          font-family: 'Roboto Slab', serif;
        }
        @media print {
          .print\:hidden {
            display: none;
          }
          body {
            background: #fff;
          }
        }
      `}</style>
      {/* Left Sidebar for Frames */}
      <div className="w-64 bg-white p-6 rounded-2xl shadow-xl flex-shrink-0 mr-8 space-y-4 print:hidden">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Frames
        </h2>
        <button
          onClick={() => setSelectedFrame('Minimalist')}
          className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${selectedFrame === 'Minimalist' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Minimalist
        </button>
        <button
          onClick={() => setSelectedFrame('Classic')}
          className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${selectedFrame === 'Classic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Classic
        </button>
        <button
          onClick={() => setSelectedFrame('Professional')}
          className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${selectedFrame === 'Professional' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Professional
        </button>
      </div>

      {/* Marksheet Preview & Print Button */}
      <div className="flex-1 flex flex-col items-center">
        <button
          onClick={handlePrint}
          className="mb-6 inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-md transition-transform transform hover:scale-105 print:hidden"
        >
          🖨️ Print Marksheet
        </button>
        <div ref={contentRef} className="print-area flex-1 w-full flex items-center justify-center">
          {renderMarksheet()}
        </div>
      </div>

      {/* Right Sidebar for Custom Assets */}
      <div className="w-64 bg-white p-6 rounded-2xl shadow-xl flex-shrink-0 ml-8 space-y-4 print:hidden">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Assets
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          />
        </div>
      </div>
    </div>
  );
};

export default MarksheetEditor;


// import { useEffect, useState, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { db } from '../bd/db';
 
// // Interfaces for data from the database
// interface MarksheetSchema {
//   id?: number;
//   name: string;
//   classId: number;
//   schemaJson: {
//     header: string;
//     footer: string;
//     fields: Array<{ label: string; fieldKey: string; type: string }>;
//     exams: Array<{ term: string; subjects: Array<{ subjectName: string; maxMarks: number }> }>;
//   };
// }

// interface Student {
//   id?: number;
//   name: string;
//   classId: number;
//   [key: string]: any;
// }

// interface Mark {
//   id?: number;
//   studentId: number;
//   schemaId: number;
//   entries: { [key: string]: number };
//   total: number;
//   percentage: number;
// }

// const sanitizeKey = (value: string) =>
//   value.replace(/[^a-zA-Z0-9]/g, '_');

// const calculateGrade = (percentage: number) => {
//   if (percentage >= 91) return "A+";
//   if (percentage >= 81) return "A";
//   if (percentage >= 71) return "B+";
//   if (percentage >= 61) return "B";
//   if (percentage >= 51) return "C";
//   if (percentage >= 41) return "D";
//   if (percentage >= 31) return "E";
//   if (percentage >= 0) return "F";
//   return "-";
// };

// const MarksheetEditor = () => {
//   const { schemaId, studentId } = useParams<{ schemaId: string; studentId: string }>();
//   const [schema, setSchema] = useState<MarksheetSchema | null>(null);
//   const [student, setStudent] = useState<Student | null>(null);
//   const [mark, setMark] = useState<Mark | null>(null);
//   const [selectedFrame, setSelectedFrame] = useState('Professional'); // Set default to Professional
//   const [customImage, setCustomImage] = useState<string | null>(null);

//   const contentRef = useRef(null);
//   const handlePrint = () => {
//     window.print();
//   };


//   useEffect(() => {
//     const loadData = async () => {
//       if (schemaId && studentId) {
//         const loadedSchema = await db.marksheetSchemas.get(Number(schemaId));
//         setSchema(loadedSchema || null);
//         const loadedMark = await db.marks.where({ studentId: Number(studentId), schemaId: Number(schemaId) }).first();
//         setMark(loadedMark || null);
//         const loadedStudent = await db.students.get(Number(studentId));
//         setStudent(loadedStudent || null);
//       }
//     };
//     loadData();
//   }, [schemaId, studentId]);

//   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setCustomImage(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };


//   if (!schema || !student || !mark) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-100">
//         <div className="text-gray-500 text-lg font-medium animate-pulse">Loading marksheet data...</div>
//       </div>
//     );
//   }

//   const getPercentageColor = (percentage: number) => {
//     if (percentage >= 90) return 'text-green-600';
//     if (percentage >= 75) return 'text-blue-600';
//     if (percentage >= 50) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const renderMarksheet = () => {
//     const renderHeader = () => (
//       <div className="text-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">{schema.schemaJson.header}</h1>
//         {customImage && (
//           <img src={customImage} alt="School Logo" className="mx-auto my-4 h-24 w-auto object-contain" />
//         )}
//       </div>
//     );

//     const renderFooter = () => (
//       <div className="mt-8 text-center text-sm italic text-gray-600 border-t border-gray-300 pt-4">
//         {schema.schemaJson.footer}
//       </div>
//     );

//     const renderStudentInfo = () => (
//       <div className="grid grid-cols-2 gap-4 mb-8">
//         {schema.schemaJson.fields.map((field) => (
//           <div key={field.fieldKey}>
//             <p className="text-sm text-gray-600 font-medium">{field.label}:</p>
//             <p className="text-gray-800 font-semibold">{student[field.fieldKey]}</p>
//           </div>
//         ))}
//       </div>
//     );

//     const renderMarksTable = () => (
//       <div className="bg-gray-50 rounded-lg p-4 mb-8">
//         {schema.schemaJson.exams.map((exam, examIdx) => (
//           <div key={examIdx} className="mb-6 last:mb-0">
//             <h3 className="text-lg font-bold text-gray-700 mb-2">{exam.term} Examination</h3>
//             <table className="w-full text-left table-auto">
//               <thead>
//                 <tr className="bg-gray-200 text-gray-700 text-sm font-semibold">
//                   <th className="px-4 py-2 rounded-tl-lg">Subject</th>
//                   <th className="px-4 py-2">Max Marks</th>
//                   <th className="px-4 py-2 rounded-tr-lg">Obtained Marks</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {exam.subjects.map((subject, subIdx) => {
//                   const key = `marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`;
//                   return (
//                     <tr key={subIdx} className="border-t border-gray-300 text-sm hover:bg-gray-100 transition-colors">
//                       <td className="px-4 py-2">{subject.subjectName}</td>
//                       <td className="px-4 py-2">{subject.maxMarks}</td>
//                       <td className="px-4 py-2">{mark.entries[key] ?? 'N/A'}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         ))}
//         <div className="flex justify-between items-center bg-blue-50 rounded-lg p-4 mt-4">
//           <span className="text-lg font-bold text-blue-700">Total Percentage:</span>
//           <span className={`text-xl font-extrabold ${getPercentageColor(mark.percentage)}`}>
//             {mark.percentage}%
//           </span>
//         </div>
//         <div className="text-right text-lg font-semibold mt-2">
//           Grade: {calculateGrade(mark.percentage)}
//         </div>
//       </div>
//     );

//     switch (selectedFrame) {
//       case 'Minimalist':
//         return (
//           <div className="bg-white p-10 shadow-lg rounded-2xl w-full max-w-2xl mx-auto">
//             {renderHeader()}
//             {renderStudentInfo()}
//             {renderMarksTable()}
//             {renderFooter()}
//           </div>
//         );
//       case 'Classic':
//         return (
//           <div className="bg-white p-10 shadow-lg border-2 border-gray-300 rounded-lg w-full max-w-2xl mx-auto">
//             {renderHeader()}
//             <div className="p-6 border-2 border-dashed border-gray-400 rounded-lg">
//               {renderStudentInfo()}
//               {renderMarksTable()}
//             </div>
//             {renderFooter()}
//           </div>
//         );
//       case 'Professional':
//         return (
//           <div className="relative bg-white p-12 border-4 border-gray-800 rounded-lg w-full max-w-2xl mx-auto font-serif shadow-2xl">
//             {/* Watermark */}
//             {customImage && (
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
//                 <img src={customImage} alt="Watermark" className="h-64 w-auto object-contain grayscale" />
//               </div>
//             )}
            
//             <div className="relative z-10">
//               <div className="border-b-4 border-gray-800 pb-4 mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <div className="text-xs font-sans">REG. NO: XXXX</div>
//                   {customImage && (
//                     <img src={customImage} alt="School Logo" className="h-20 w-auto object-contain" />
//                   )}
//                   <div className="text-xs font-sans">DISE CODE: XXXX</div>
//                 </div>
//                 <div className="text-center font-bold text-gray-900">
//                   <h1 className="text-4xl uppercase">{schema.schemaJson.header}</h1>
//                   <p className="text-xl italic font-normal mt-1">
//                     Annual Examination Report Card
//                   </p>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm font-sans mb-8">
//                 {schema.schemaJson.fields.map((field) => (
//                   <div key={field.fieldKey} className="flex items-end border-b border-gray-400 pb-1">
//                     <span className="font-semibold text-gray-700 flex-shrink-0 mr-2">{field.label}:</span>
//                     <span className="flex-1 font-medium text-gray-900 truncate">{student[field.fieldKey]}</span>
//                   </div>
//                 ))}
//               </div>

//               {schema.schemaJson.exams.map((exam, examIdx) => (
//                 <div key={examIdx} className="mb-8">
//                   <h3 className="text-lg font-bold text-center border-y border-gray-700 py-2 bg-gray-100">{exam.term} Examination</h3>
//                   <table className="w-full text-left table-auto border-collapse border border-gray-400">
//                     <thead className="bg-gray-200">
//                       <tr>
//                         <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Subject</th>
//                         <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Max Marks</th>
//                         <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Obtained Marks</th>
//                         <th className="px-4 py-2 border border-gray-400 font-bold text-sm">Grade</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {exam.subjects.map((subject, subIdx) => {
//                         const key = `marks_${sanitizeKey(exam.term)}_${sanitizeKey(subject.subjectName)}`;
//                         const obtainedMark = mark.entries[key] ?? 'N/A';
//                         return (
//                           <tr key={subIdx} className="text-sm">
//                             <td className="px-4 py-2 border border-gray-300">{subject.subjectName}</td>
//                             <td className="px-4 py-2 border border-gray-300">{subject.maxMarks}</td>
//                             <td className="px-4 py-2 border border-gray-300">{obtainedMark}</td>
//                             <td className="px-4 py-2 border border-gray-300">{obtainedMark !== 'N/A' ? calculateGrade((obtainedMark / subject.maxMarks) * 100) : '-'}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               ))}
              
//               <div className="flex justify-between items-center text-sm font-sans border-t-2 border-gray-800 pt-4">
//                 <div className="flex-1 flex flex-col items-center">
//                   <span className="font-bold text-lg">{mark.percentage}%</span>
//                   <span className="text-xs text-gray-600">Overall Percentage</span>
//                 </div>
//                 <div className="flex-1 flex flex-col items-center">
//                   <span className="font-bold text-lg">{calculateGrade(mark.percentage)}</span>
//                   <span className="text-xs text-gray-600">Overall Grade</span>
//                 </div>
//               </div>

//               <div className="mt-8 text-center text-sm font-sans text-gray-600">
//                 {schema.schemaJson.footer}
//               </div>

//             </div>
//           </div>
//         );
//       default:
//         return (
//           <div className="bg-white p-10 shadow-lg rounded-2xl w-full max-w-2xl mx-auto">
//             {renderHeader()}
//             {renderStudentInfo()}
//             {renderMarksTable()}
//             {renderFooter()}
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="font-sans min-h-screen bg-gray-100 p-8 flex">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
//         @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap');
//         .font-sans {
//           font-family: 'Poppins', sans-serif;
//         }
//         .font-serif {
//           font-family: 'Roboto Slab', serif;
//         }
//         @media print {
//           .print\:hidden {
//             display: none;
//           }
//           body {
//             background: #fff;
//           }
//         }
//       `}</style>
//       {/* Left Sidebar for Frames */}
//       <div className="w-64 bg-white p-6 rounded-2xl shadow-xl flex-shrink-0 mr-8 space-y-4 print:hidden">
//         <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
//           Frames
//         </h2>
//         <button
//           onClick={() => setSelectedFrame('Minimalist')}
//           className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${selectedFrame === 'Minimalist' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
//         >
//           Minimalist
//         </button>
//         <button
//           onClick={() => setSelectedFrame('Classic')}
//           className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${selectedFrame === 'Classic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
//         >
//           Classic
//         </button>
//         <button
//           onClick={() => setSelectedFrame('Professional')}
//           className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${selectedFrame === 'Professional' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
//         >
//           Professional
//         </button>
//       </div>

//       {/* Marksheet Preview & Print Button */}
//       <div className="flex-1 flex flex-col items-center">
//         <button
//           onClick={handlePrint}
//           className="mb-6 inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-md transition-transform transform hover:scale-105 print:hidden"
//         >
//           🖨️ Print Marksheet
//         </button>
//         <div ref={contentRef} className="print-area flex-1 w-full flex items-center justify-center">
//           {renderMarksheet()}
//         </div>
//       </div>

//       {/* Right Sidebar for Custom Assets */}
//       <div className="w-64 bg-white p-6 rounded-2xl shadow-xl flex-shrink-0 ml-8 space-y-4 print:hidden">
//         <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
//           Assets
//         </h2>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Upload Logo
//           </label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageUpload}
//             className="w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-full file:border-0
//             file:text-sm file:font-semibold
//             file:bg-blue-50 file:text-blue-700
//             hover:file:bg-blue-100"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MarksheetEditor;

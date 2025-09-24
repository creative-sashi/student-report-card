import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MarksheetForm from "./MarksheetForm";
import { db } from "../bd/db";

interface Student {
  id: number;
  name: string;
  rollNo?: string; // Corrected field to match the database schema
  schoolId: string;
  classId: string;
  schemaId: string;
}

interface SavedEntry {
  id: number;
  percentage: number;
  student: Student;
  [key: string]: any;
}

function StudentList() {
  const { schoolId, classId, schemaId } = useParams();
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadEntries = async () => {
      const allMarks = await db.marks.where("schemaId").equals(Number(schemaId)).toArray();

      const withStudentDetails: any = await Promise.all(
        allMarks.map(async (mark) => {
          const student = await db.students.get(mark.studentId);
          return { ...mark, student };
        })
      );
      setSavedEntries(withStudentDetails);
    };

    loadEntries();
  }, [schemaId]);

  const handleCreated = (newEntry: SavedEntry) => {
    setSavedEntries((prev) => [...prev, newEntry]);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .font-sans {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
      {/* Navbar */}
      <div className="bg-white shadow sticky top-0 z-10 px-6 py-6 flex justify-between items-center rounded-3xl">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Student Entries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schema: <span className="font-medium">{schemaId}</span> · Class:{" "}
            <span className="font-medium">{classId}</span> · School:{" "}
            <span className="font-medium">{schoolId}</span>
          </p>
        </div>
        <div>
          <button
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-6 py-3 rounded-full shadow-md transition-transform transform hover:scale-105"
            onClick={() => setShowForm(true)}
          >
            + Add Student
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fadeInUp">
            <MarksheetForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Students Grid */}
      <div className="p-8 max-w-6xl flex-1 flex items-center justify-center">
        {savedEntries.length === 0 ? (
          <div className="text-gray-500 text-center">
            <h3 className="text-xl font-medium">No student entries found for this schema.</h3>
            <p className="text-sm mt-2">Click "Add Student" to create the first entry.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
            {savedEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 p-6 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-gray-800">{entry.student?.name}</h4>
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 rounded-full px-3 py-1">
                    {entry.percentage}%
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Roll No: {entry.student?.rollNo}</p>
                <button
                  onClick={() => console.log("Print", entry.id)}
                  className="mt-4 self-end text-sm text-blue-600 font-semibold hover:underline"
                >
                  🖨️ Print Marksheet
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentList;

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../bd/db";
import MarksheetForm from "./MarksheetForm";

interface Student {
    id: number;
    name: string;
    rollNumber: string;
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
        // empty the form 
        setSavedEntries((prev) => [...prev, newEntry]);
        // close the form   
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <div className="bg-white shadow sticky top-0 z-10 px-6 py-4 flex justify-between items-center border-b">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                    <p className="text-sm text-gray-500">
                        Schema: <span className="font-medium">{schemaId}</span> · Class:{" "}
                        <span className="font-medium">{classId}</span> · School:{" "}
                        <span className="font-medium">{schoolId}</span>
                    </p>
                </div>
                <div>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Student
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto p-6 animate-fadeInUp">
                        <MarksheetForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
                    </div>
                </div>
            )}

            {/* Students Grid */}
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Entries</h2>

                {savedEntries.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No entries found.</div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {savedEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between"
                            >
                                <p className="text-lg font-medium text-gray-800">
                                    {entry.student?.name}
                                </p>

                                <button
                                    onClick={() => console.log("Print", entry.id)}
                                    className="mt-3 self-end text-sm text-blue-600 hover:underline"
                                >
                                    🖨️ Print
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
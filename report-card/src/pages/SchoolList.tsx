import { useEffect, useState } from "react";

// importing components
import SchoolCard, { type School } from "../features/schools/SchoolCard";
import SchoolForm from "../features/schools/SchoolForm";

// importing icons
import Plus from "../assets/icons/Plus";

// import the database instance
import { db } from "../bd/db";
import { exportSchoolData, importSchoolData } from "../utils/exportImport";

export default function SchoolList() {
  const [schools, setSchools] = useState<School[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    const dbResult = await db.schools.toArray();
    const result: School[] = dbResult.map((school) => ({
      ...school,
      id: school.id ?? "",
    }));
    setSchools(result);
  };

  const handleCreated = () => {
    setShowForm(false);
    loadSchools();
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          🏫 Schools
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm focus:ring-2 focus:ring-blue-400">
            📥 Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden" // hides the default file input
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log("Importing file:", file.name);
                  importSchoolData(file)
                    .then(() => {
                      alert("Data imported successfully!");
                      loadSchools();
                    })
                    .catch((err) => alert("Failed to import: " + err.message));
                }
              }}
            />
          </label>

          {/* Export */}
          <button
            onClick={exportSchoolData}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            📤 Export JSON
          </button>

          {/* Create School */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex cursor-pointer items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Plus />
            <span className="hidden sm:block">Create New School</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto p-6 animate-fadeInUp">
            <SchoolForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* School cards */}
      {schools.length === 0 ? (
        <div className="mt-16 text-center text-slate-600 max-w-xl mx-auto px-4">
          <div className="text-6xl mb-4">🏫</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
            No schools created yet
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            Start by creating your first school to manage classes, students, and marksheets digitally.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Plus />
            Create New School
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
          {schools.map((detail: School) => (
            <SchoolCard key={detail.id} school={detail} />
          ))}
        </div>
      )}
    </>
  );
}

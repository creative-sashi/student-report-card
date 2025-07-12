import { useEffect, useState } from "react";
import SchoolCard from "../features/schools/SchoolCard";
import SchoolForm from "../features/schools/SchoolForm";
import { db } from "../bd/db";

type School = {
  id?: number | string | undefined | any;
  name: string,
  address: string,
  logoBlobId?: string,
};

export default function SchoolList() {
  const [schools, setSchools] = useState<School[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    const result: School[] = await db.schools.toArray();
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

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg
            className="w-4 h-4 stroke-current "
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className=" hidden sm:block">Create New School</span>
        </button>
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
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New School
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
          {schools.map((detail: any) => (
            <SchoolCard key={detail.id} school={detail} />
          ))}
        </div>
      )}
    </>
  );
}

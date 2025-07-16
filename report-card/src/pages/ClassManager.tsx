import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../bd/db';

const ClassManager = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams<{ schoolId: string }>();

  // usestate to manage school and classes
  const [school, setSchool] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [className, setClassName] = useState('');

  // load the initial data from the idb
  useEffect(() => {
    if (schoolId) {
      db.schools.get(Number(schoolId)).then(setSchool);
      db.classes.where('schoolId').equals(Number(schoolId)).toArray().then(setClasses);
    }
  }, [schoolId]);

  const handleAddClass = async () => {
    if (!className.trim()) return;
    await db.classes.add({ name: className.trim(), schoolId: Number(schoolId) });
    setClassName('');
    const updated = await db.classes.where('schoolId').equals(Number(schoolId)).toArray();
    setClasses(updated);
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              🎓 {school?.name || 'School'} – Class Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage classes and sections for this school.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Enter class name (e.g., Class 1A)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddClass}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-md shadow-sm transition"
            >
              Add Class
            </button>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="text-center mt-20 text-slate-500">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-lg font-semibold text-slate-700">No classes yet</h2>
            <p className="text-sm mt-1">Use the form above to add your first class.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => navigate(`/schools/${schoolId}/classes/${cls.id}`)}
                className="cursor-pointer rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md p-5 flex items-center justify-between transition group"
              >
                <div className="text-slate-800 font-medium text-base group-hover:text-blue-600 transition">
                  {cls.name}
                </div>
                <div className="text-slate-400 group-hover:text-blue-500 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManager;

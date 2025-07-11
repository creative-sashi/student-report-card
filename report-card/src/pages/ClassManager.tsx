// src/pages/ClassManager.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../bd/db';

const ClassManager = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const [school, setSchool] = useState<any>(null);
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (schoolId) {
      db.schools.get(Number(schoolId)).then(setSchool);
      db.classes.where('schoolId').equals(Number(schoolId)).toArray().then(setClasses);
    }
  }, [schoolId]);

  const handleAddClass = async () => {
    if (!className) return;
    await db.classes.add({
      name: className,
      schoolId: Number(schoolId),
    });
    setClassName('');
    const updated = await db.classes.where('schoolId').equals(Number(schoolId)).toArray();
    setClasses(updated);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">
        {school?.name} – Class Management
      </h1>

      <div className="flex items-center gap-2 my-4">
        <input
          type="text"
          placeholder="Enter class (e.g., Class 1A)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={handleAddClass}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Class
        </button>
      </div>

      <div className="grid gap-3">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="border rounded p-3 shadow hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/schools/${schoolId}/classes/${cls.id}`)}
          >
            <strong>{cls.name}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassManager;

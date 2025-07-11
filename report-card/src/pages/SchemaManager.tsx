// src/pages/SchemaManager.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../bd/db';
import SchemaBuilder from './SchemaBuilder';

interface Schema {
  id: number;
  name: string;
  classId: number;
  schemaJson: any;
  uiSchemaJson: any;
}

const SchemaManager = () => {
  const { classId } = useParams<{ classId: string }>();
  const [schemas, setSchemas] = useState<Schema[]>([]);

  const loadSchemas = async () => {
    if (!classId) return;
    const result = await db.marksheetSchemas.where('classId').equals(Number(classId)).toArray();
    setSchemas(result);
  };

  useEffect(() => {
    loadSchemas();
  }, [classId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Schemas for this Class</h2>

      {/* Replace this with your dynamic SchemaBuilder */}
      {classId && (
        <SchemaBuilder classId={Number(classId)} onSaved={loadSchemas} />
      )}

      <h3 className="text-lg font-semibold mt-6 mb-2">Existing Schemas</h3>
      <ul className="space-y-2">
        {schemas.map((s) => (
          <li key={s.id} className="p-3 border rounded shadow bg-gray-50">
            <Link to={`/schemas/${s.id}`} className="text-blue-600 underline">
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SchemaManager;

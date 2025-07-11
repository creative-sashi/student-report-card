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

export default function SchoolPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadSchools();
    }, []);

    const loadSchools = async () => {
        const result : School[] = await db.schools.toArray();
        setSchools(result);
    };

    const handleCreated = () => {
        setShowForm(false);
        loadSchools();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Schools</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        {showForm ? "Cancel" : "Create New School"}
                    </button>
                </div>

                {showForm && <SchoolForm onCreated={handleCreated} />}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {schools.map((school) => (
                        <SchoolCard key={school.id} school={school} />
                    ))}
                </div>
            </div>
        </div>
    );
}

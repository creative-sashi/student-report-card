import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { db } from '../../bd/db';

// Props type for optional callback
interface SchoolFormProps {
  onCreated?: () => void;
}

const SchoolForm: React.FC<SchoolFormProps> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let logoBlobId: string | undefined;

    if (logoFile) {
      logoBlobId = `logo_${Date.now()}`;

      // File is already a Blob — no need for arrayBuffer here
      await db.media.put({
        id: logoBlobId,
        type: 'logo',
        blob: logoFile,
        fileName: logoFile.name,
        mimeType: logoFile.type,
      });
    }

    await db.schools.add({
      name,
      address,
      logoBlobId,
    });

    // Reset state
    setName('');
    setAddress('');
    setLogoFile(null);
    onCreated?.(); // callback if passed
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLogoFile(e.target.files?.[0] || null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow mb-6 space-y-4"
    >
      <div>
        <label className="block font-medium mb-1">School Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Location / Address</label>
        <input
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">School Logo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save School
      </button>
    </form>
  );
};

export default SchoolForm;

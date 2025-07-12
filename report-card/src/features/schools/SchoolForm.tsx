import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { db } from '../../bd/db';

interface SchoolFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

const SchoolForm: React.FC<SchoolFormProps> = ({ onCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let logoBlobId: string | undefined;

    if (logoFile) {
      logoBlobId = `logo_${Date.now()}`;
      await db.media.put({
        id: logoBlobId,
        type: 'logo',
        blob: logoFile,
        fileName: logoFile.name,
        mimeType: logoFile.type,
      });
    }

    await db.schools.add({ name, address, logoBlobId });

    setName('');
    setAddress('');
    setLogoFile(null);
    setLogoPreview(null);
    onCreated?.();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoFile(file || null);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <input
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Logo Upload with Preview */}
        <div className="relative w-full sm:w-64 aspect-square rounded-xl overflow-hidden border border-dashed border-slate-300 bg-slate-50 shadow-sm hover:shadow-md transition cursor-pointer group">
        {/* Actual input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />

        {/* Preview or placeholder */}
        {logoPreview ? (
          <img
            src={logoPreview}
            alt="Logo Preview"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
            Upload Logo
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none z-20">
          <span className="text-white text-sm font-semibold">Change Logo</span>
        </div>
      </div>
  

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm shadow-sm cursor-pointer"
        >
          Save School
        </button>
      </div>
    </form>
  );
};

export default SchoolForm;

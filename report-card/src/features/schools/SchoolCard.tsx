import { useEffect, useState } from "react";
import { db } from "../../bd/db";
import { useNavigate } from "react-router-dom";

export interface School {
  id: number | string;
  name: string;
  address: string;
  logoBlobId?: number | string;
}

export interface SchoolCardProps {
  school: School;
}

const SchoolCard = ({ school }: SchoolCardProps) => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      if (school.logoBlobId) {
        const media = await db.media.get(String(school.logoBlobId));
        if (media?.blob) {
          const url = URL.createObjectURL(media.blob);
          setLogoUrl(url);
        }
      }
    };
    loadLogo();

    // Optional: cleanup URL object when unmounted
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [school.logoBlobId]);

  return (
    <div
      onClick={() => navigate(`/schools/${school.id}`)}
      className="group rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition duration-300 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-slate-100">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${school.name} Logo`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-in-out"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 text-xl font-bold text-blue-700">
            {school.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-300" />
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 truncate">{school.name}</h2>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{school.address}</p>
      </div>
    </div>
  );
};

export default SchoolCard;

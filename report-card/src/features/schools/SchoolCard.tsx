import { useEffect, useState } from "react";
import { db } from "../../bd/db";

interface School {
  name: string;
  address: string;
  logoBlobId?: number | string;
}

interface SchoolCardProps {
  school: School;
}

const SchoolCard = ({ school }: SchoolCardProps) => {
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
    <div className="bg-white rounded shadow p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{school.name}</h2>
        <p className="text-sm text-gray-600 mt-1">{school.address}</p>
      </div>
      {logoUrl && (
        <div className="mt-4">
          <img
            src={logoUrl}
            alt="School Logo"
            className="h-16 w-16 object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default SchoolCard;

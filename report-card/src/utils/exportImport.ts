import { db } from "../bd/db";

function base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
  return fetch(base64)
    .then(res => res.blob())
    .then(blob => new Blob([blob], { type: mimeType }));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportSchoolData() {
  const [
    schools,
    media,
    classes,
    marksheetSchemas,
    students,
    marks
  ] = await Promise.all([
    db.schools.toArray(),
    db.media.toArray(),
    db.classes.toArray(),
    db.marksheetSchemas.toArray(),
    db.students.toArray(),
    db.marks.toArray()
  ]);

  // Convert media blobs to base64
  const mediaWithBase64 = await Promise.all(media.map(async (m) => {
    const base64 = await blobToBase64(m.blob);
    return {
      ...m,
      blobBase64: base64,
      blob: undefined, // remove original blob
    };
  }));

  const exportPayload = {
    meta: {
      version: 2,
      exportedAt: new Date().toISOString()
    },
    schools,
    media: mediaWithBase64,
    classes,
    marksheetSchemas,
    students,
    marks
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `school-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}


export async function importSchoolData(file: File) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.schools || !data.media) throw new Error('Invalid data format');

  // ✅ First convert base64 to Blob outside the transaction
  const mediaWithBlobs = await Promise.all(
    data.media.map(async (m: any) => {
      const blob = await base64ToBlob(m.blobBase64, m.mimeType);
      return { ...m, blob };
    })
  );

  // ✅ Now perform DB operations inside the Dexie transaction
  await db.transaction(
    'rw',
    [db.schools, db.media, db.classes, db.marksheetSchemas, db.students, db.marks],
    async () => {
      await Promise.all([
        db.schools.clear(),
        db.media.clear(),
        db.classes.clear(),
        db.marksheetSchemas.clear(),
        db.students.clear(),
        db.marks.clear()
      ]);

      await Promise.all([
        db.schools.bulkAdd(data.schools),
        db.media.bulkAdd(mediaWithBlobs),
        db.classes.bulkAdd(data.classes),
        db.marksheetSchemas.bulkAdd(data.marksheetSchemas),
        db.students.bulkAdd(data.students),
        db.marks.bulkAdd(data.marks)
      ]);
    }
  );
}



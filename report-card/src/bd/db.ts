// db.ts
import Dexie from 'dexie';

export interface School {
  id?: number;
  name: string;
  address: string;
  logoBlobId?: string;
}

export interface Media {
  id: string;
  type: 'logo';
  blob: Blob;
  fileName: string;
  mimeType: string;
}

class SchoolDB extends Dexie {
  schools: Dexie.Table<School, number>;
  media: Dexie.Table<Media, string>;

  constructor() {
    super('SchoolDB');
    this.version(1).stores({
      schools: '++id, name',
      media: 'id, type',
    });

    this.schools = this.table('schools');
    this.media = this.table('media');
  }
}

export const db = new SchoolDB();

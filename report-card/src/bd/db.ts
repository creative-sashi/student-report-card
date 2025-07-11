// // db.ts
// import Dexie from 'dexie';

// export interface School {
//   id?: number;
//   name: string;
//   address: string;
//   logoBlobId?: string;
// }

// export interface Media {
//   id: string;
//   type: 'logo';
//   blob: Blob;
//   fileName: string;
//   mimeType: string;
// }

// class SchoolDB extends Dexie {
//   schools: Dexie.Table<School, number>;
//   media: Dexie.Table<Media, string>;

//   constructor() {
//     super('SchoolDB');
//     this.version(1).stores({
//       schools: '++id, name',
//       media: 'id, type',
//     });

//     this.schools = this.table('schools');
//     this.media = this.table('media');
//   }
// }

// export const db = new SchoolDB();


import Dexie from 'dexie';

// ✅ School table
export interface School {
  id?: number;
  name: string;
  address: string;
  logoBlobId?: string;
}

// ✅ Media table
export interface Media {
  id: string;
  type: 'logo';
  blob: Blob;
  fileName: string;
  mimeType: string;
}

// ✅ Class table
export interface SchoolClass {
  id?: number;
  schoolId: number;
  name: string;
  stream?: string;
  activeMarksheetSchemaId?: number;
}

// ✅ Marksheet Schema table
export interface MarksheetSchema {
  id?: number;
  classId: number;
  name: string;
  schemaJson: any;
  uiSchemaJson?: any;
  defaultFrames?: string;
}

class SchoolDB extends Dexie {
  schools: Dexie.Table<School, number>;
  media: Dexie.Table<Media, string>;
  classes: Dexie.Table<SchoolClass, number>;
  marksheetSchemas: Dexie.Table<MarksheetSchema, number>;

  constructor() {
    super('SchoolDB');

    // ⬇️ Update this version number when you add new tables or indexes
  this.version(2).stores({
  schools: '++id, name',
  media: 'id, type',
  classes: '++id, schoolId, name',          // ✅ no schoolId+name
  marksheetSchemas: '++id, classId',
});

    // Table mappings
    this.schools = this.table('schools');
    this.media = this.table('media');
    this.classes = this.table('classes');
    this.marksheetSchemas = this.table('marksheetSchemas');
  }
}

// 👇 Export your DB instance
export const db = new SchoolDB();

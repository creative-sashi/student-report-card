// src/db/db.ts
import Dexie from 'dexie';

// -------------------------
// Table Interfaces
// -------------------------

// 🏫 School
export interface School {
  id?: number;
  name: string;
  address: string;
  logoBlobId?: string; // points to a media entry
}

// 🖼️ Media
export interface Media {
  id: string; // use UUID
  type: 'logo';
  blob: Blob;
  fileName: string;
  mimeType: string;
}

// 🏷️ Class
export interface SchoolClass {
  id?: number;
  schoolId: number;
  name: string;
  stream?: string;
  activeMarksheetSchemaId?: number;
}

// 📋 Marksheet Schema
export interface MarksheetSchema {
  id?: number;
  classId: number;
  name: string;
  schemaJson: any;         // structure: { subjects: [{ subjectName, maxMarks }] }
  uiSchemaJson?: any;
  defaultFrames?: string;
}

// 👩‍🎓 Student
export interface Student {
  id?: number;
  classId: number;         // FK to SchoolClass
  name: string;
  rollNo?: string;
  additionalInfo?: Record<string, any>; // guardian, DOB, address, etc.
}

// 🧾 Mark
export interface Mark {
  id?: number;
  studentId: number;
  schemaId: number;
  entries: { [key: string]: number }; // <-- Add this line
  total: number;
  percentage: number;
  createdAt: Date;
}

// -------------------------
// Dexie Database Class
// -------------------------

class SchoolDB extends Dexie {
  schools: Dexie.Table<School, number>;
  media: Dexie.Table<Media, string>;
  classes: Dexie.Table<SchoolClass, number>;
  marksheetSchemas: Dexie.Table<MarksheetSchema, number>;
  students: Dexie.Table<Student, number>;
  marks: Dexie.Table<Mark, number>;

  constructor() {
    super('SchoolDB');

    this.version(2).stores({
      schools: '++id, name',
      media: 'id, type',
      classes: '++id, schoolId, name',
      marksheetSchemas: '++id, classId',
      students: '++id, classId, name',
      marks: '++id, studentId, schemaId' // Indexes for lookup
    });

    this.schools = this.table('schools');
    this.media = this.table('media');
    this.classes = this.table('classes');
    this.marksheetSchemas = this.table('marksheetSchemas');
    this.students = this.table('students');
    this.marks = this.table('marks');
  }
}

// -------------------------
// Export DB Instance
// -------------------------

export const db = new SchoolDB();

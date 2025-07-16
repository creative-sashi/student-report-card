# 📘 Marksheet Schema Builder & Form Entry System
<img width="1897" height="910" alt="image" src="https://github.com/user-attachments/assets/eaad2f47-94eb-4085-8acd-168bb5320f61" />

A dynamic form builder and student marksheet management system built with **React**, **Formik**, and **IndexedDB (via Dexie.js)**. This application allows school admins or teachers to:

- Create dynamic marksheet schemas with customizable fields and subjects.
- Store these schemas per class and school.
- Fill out marksheets for students based on defined schemas.
- Prepare for printing or exporting generated marksheets.

## 🚀 Features

- ✅ School and Class Management
- ✅ Customizable Schema Builder (fields + exams + subjects)
- ✅ Form Rendering based on Saved Schema
- ✅ Formik + Yup integration for validation
- ✅ IndexedDB (Dexie.js) for persistent local storage
- ✅ Meta (shadcn-inspired) clean design with responsive layout


markdown
Copy
Edit

## 🛠️ Technologies Used

- **React 18**
- **React Router DOM**
- **Formik** – for form handling
- **Yup** – for schema-based validation
- **Dexie.js** – for working with IndexedDB
- **Tailwind CSS** – for responsive design
- **TypeScript** – with strong typings

## 📋 How It Works

### Step 1: Create Schema

1. Navigate to `/schools/:schoolId/classes/:classId/schema-builder`
2. Enter:
   - Schema Name, Header, Footer
   - Custom Fields (e.g., Student Name, Roll No)
   - Exam Terms with subjects and max marks

### Step 2: Fill Marksheet

1. Click on a saved schema card
2. Navigate to `/schemas/:schemaId`
3. Fill in the student details and marks
4. Submit for preview or persistence (next step: PDF rendering)

## 📸 Screenshots

> (Add screenshots here showing SchemaBuilder and MarksheetForm pages)

## 📦 Installation

```bash
git clone https://github.com/your-username/marksheet-builder.git
cd marksheet-builder
npm install
npm run dev
Make sure you have Node.js and npm installed.

🔧 Future Improvements
 Marksheet Preview & PDF Export

 Student Management

 Print Layout Mode

 Sync schemas with cloud backend (optional)

🧑‍💻 Author
Sashi Singh – @sashi-dev

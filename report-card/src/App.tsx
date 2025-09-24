// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// importing pages 
import SchoolList from './pages/SchoolList';
import ClassManager from './pages/ClassManager';
import MarksheetForm from './pages/MarksheetForm';
import SchemaBuilder from './pages/SchemaBuilder';
import Home from './pages/Home';
import StudentList from './pages/StudentList';
import MarksheetEditor from './pages/MarkSheetEditor';


// initial routing here
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e0e7ff] text-gray-800 p-4 md:p-8">
      <div className="">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schools" element={<SchoolList />} />
            <Route path="/schools/:schoolId" element={<ClassManager />} />
            <Route path="/schools/:schoolId/classes/:classId" element={<SchemaBuilder />} />
            <Route
              path="/schools/:schoolId/classes/:classId/schemas/:schemaId"
              element={<StudentList />}
            />
                <Route
              path="/schools/:schoolId/classes/:classId/schemas/:schemaId/students/:studentId"
              element={<MarksheetEditor />}
            />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

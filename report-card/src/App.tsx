// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// importing pages 
import SchoolList from './pages/SchoolList';
import ClassManager from './pages/ClassManager';
import MarksheetForm from './pages/MarksheetForm';
import SchemaBuilder from './pages/SchemaBuilder';
import Home from './pages/Home';


// initial routing here
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e0e7ff] text-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schools" element={<SchoolList />} />
            <Route path="/schools/:schoolId" element={<ClassManager />} />
            <Route path="/schools/:schoolId/classes/:classId" element={<SchemaBuilder />} />
            <Route
              path="/schools/:schoolId/classes/:classId/schemas/:schemaId"
              element={<MarksheetForm />}
            />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

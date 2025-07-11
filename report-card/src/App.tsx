// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SchoolList from './pages/SchoolList';
import ClassManager from './pages/ClassManager';
import SchemaManager from './pages/SchemaManager';
import MarksheetForm from './pages/MarksheetForm';


export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
    <Router>
      <Routes>
        <Route path="/" element={<SchoolList />} />
        <Route path="/schools/:schoolId" element={<ClassManager />} />
        <Route path="/schools/:schoolId/classes/:classId" element={<SchemaManager />} />
        <Route path="/schemas/:schemaId" element={<MarksheetForm />} />

      </Routes>
    </Router>
    </div>
  );
}

import TextEditor from "./TextEditor";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from "./components/Login";
import Register from './components/Register';
import DocumentsList from './components/DocumentsList';
import { v4 as uuidV4 } from 'uuid';

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

function App() {
  return (
    <Router>
            {/* <nav>
                <Link to="/">Login</Link> | <Link to="/register">Register</Link>      
            </nav> */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* <Route path="/documents" element={isAuthenticated() ? <Home /> : <Navigate to="/" />} />
                <Route path="/editor/:id" element={<DocumentEditor />} /> */}
                <Route path="/documents" exact element={<Navigate to={`/documents/${uuidV4()}`} /> } />

                <Route path="/documents/:id" element={<TextEditor />} />
                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/documentslist" element={<DocumentsList />} />
            </Routes>
    </Router>
  );
}

export default App;

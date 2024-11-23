import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  // Fetch documents on load
  const fetchDocuments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    try {
        const response = await axios.get('http://localhost:5000/api/documents', {
            headers: { Authorization: `Bearer ${token}` },
        });
        setDocuments(response.data);
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
};

  // Handle Edit Document
  const handleEdit = async (id) => {
    // Confirm navigation to edit
    if (window.confirm("Do you want to edit this document?")) {
      // Navigate to the editor page with the document ID
      window.location.href = `/documents/${id}`;
    }
  };
  
  
  // Handle Delete Document
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await fetch(`http://localhost:5000/api/documents/${id}`, {
        method: 'DELETE',
      });
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc._id !== id));
    }
  };

    useEffect(() => {
        fetchDocuments();
    }, []);


  return (
    <div style={{ padding: "20px" }}>
      <h2>My Documents</h2>
      {documents.length === 0 ? (
        <p>No documents found. Create a new one!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {documents.map((doc) => (
            <li key={doc._id} style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #ddd",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <span style={{ fontSize: "18px" }}>{doc.title || "Untitled"}</span>
                <div>
                <button onClick={() => handleEdit(doc._id)}
                    style={{
                      marginRight: "10px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      background: "#4caf50",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    style={{
                      padding: "5px 10px",
                      cursor: "pointer",
                      background: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

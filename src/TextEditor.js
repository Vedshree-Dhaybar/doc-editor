import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import "quill/dist/quill.snow.css"
import { io } from 'socket.io-client'
import { useParams, useNavigate } from 'react-router-dom'

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header : [1, 2, 3, 4, 5, 6, false]}],
  [{ font: []}],
  [{ list: "oredered"}, { list: "bullet"}],
  [ "bold", "italic", "underline"],
  [{ color: [] }, {background: []}],
  [{ scrpit: "sub"}, { script: "super"}],
  [{align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]

export default function TextEditor() {
  const {id: documentId} = useParams()
  const [socket, setSocket]=useState()
  const [quill, setQuill]=useState()
  const [title, setTitle] = useState("");
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const s = io("http://localhost:3001")
    setSocket(s)

    return ()=>{
      s.disconnect()
    }
  }, [])

  useEffect(()=>{
    if(socket == null || quill == null ) return

    socket.once("load-document", document => {
      quill.setContents(document.data || "");
      setTitle(document.title || "Untitled");
      quill.enable()
    })

    socket.emit('get-document', documentId)
  }, [socket, quill, documentId])

  useEffect(()=>{
    if(socket == null || quill == null ) return

      const interval = setInterval(()=> {
        socket.emit('save-document', { data: quill.getContents(),
          title,})
      }, SAVE_INTERVAL_MS)

      return()=>{
        clearInterval(interval)
      }
  }, [socket, quill, title])

   // Listen for title changes from other users
   useEffect(() => {
    if (socket == null) return;

    const handleTitleChange = (newTitle) => {
      setTitle(newTitle);
    };

    socket.on("title-update", handleTitleChange);

    return () => {
      socket.off("title-update", handleTitleChange);
    };
  }, [socket]);

  // Broadcast title changes when the user types
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (socket != null) {
      socket.emit("update-title", newTitle);
    }
  };

  useEffect(()=>{
    if (socket == null || quill == null) return
    
    const handler = delta =>{
      quill.updateContents(delta)
    }
    socket.on('receive-changes', handler )

    return ()=>{
      socket.off('receive-changes', handler)
    }
  }, [socket, quill])

  useEffect(()=>{
    if (socket == null || quill == null) return
    
    const handler = (delta, oldDelta, source) =>{
      if(source !== 'user') return
      socket.emit("send-changes", delta)
    }
    quill.on('text-change', handler )

    return () =>  {
      quill.off('text-change', handler)
    }
  }, [socket, quill])


  const WrapperRef = useCallback((wrapper)=>{
        if(wrapper == null) return

        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor,{
          theme:"snow", 
          modules: {toolbar: TOOLBAR_OPTIONS },
         })
         q.disable()
         q.setText("Loading...")
        setQuill(q)
    }, [])

  
    const handleSignOut = () => {
      // Clear user session and redirect to login
      navigate('/login');
    };
  
    const handleNewDocument = () => {
      navigate('/document');
      // window.location.reload(); // Simulate new document creation
    };

    // const handleOpenDocuments = async () => {
    //   const response = await fetch("http://localhost:3001/api/documents"); // Fetch documents
    //   const docs = await response.json();
    //   setDocuments(docs);
    //   setIsModalOpen(true); // Open the dialog box
    // };
  
    const handleOpenDocuments = () => {
      navigate('/documentslist');
    };
    

  return (

    <>
      <Navbar
        onSignOut={handleSignOut}
        onNewDocument={handleNewDocument}
        onOpenDocuments={handleOpenDocuments}
      />
      <div style={{ padding: "10px" }}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter document title"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            fontSize: "18px",
          }}
        />
      </div>
      <div className='container' ref={WrapperRef}></div>
    </>
  );
}

function Navbar({ onSignOut, onNewDocument, onOpenDocuments }) {
  return (
    <nav className="navbar">
      <h1>Text Editor</h1>
      <div className="dropdown">
        <button className="dropdown-toggle">Menu</button>
        <div className="dropdown-menu">
          <button onClick={onSignOut}>Sign Out</button>
          <button onClick={onNewDocument}>New Document</button>
          <button onClick={onOpenDocuments}>Open Document</button>
        </div>
      </div>
    </nav>
  );
}


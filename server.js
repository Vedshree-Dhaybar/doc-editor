require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const Document = require("./Document")
const User = require("./User")

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://vedupatil0710:Vedu%401024@cluster0.6qhlg.mongodb.net/doc-editor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

const io=require("socket.io")(3001, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})


// Routes
// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
console.log(secretKey);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

// Register Route
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the user
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/document/:id', (req, res) => {
  const token = req.query.token || req.headers['authorization'];
  // Validate token and respond accordingly
});

// Get documents 
app.get('/api/documentslist', async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});


// Delete a document by ID
app.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  await Document.findByIdAndDelete(id);
  res.status(200).send('Document deleted');
});

  
  //Create New Document 
  app.post('/api/documentslist', async (req, res) => {
    const userId = req.user.id; // Replace with session-based authentication
    const newDocument = new Document({ title: "", userId, content: "" });
    await newDocument.save();
    res.json(newDocument);
  });
  
  app.get("/api/documents", async (req, res) => {
    const documents = await Document.find({}, "_id title");
    res.json(documents);
  });

// const defaultValue = ""

// io.on("connection", socket =>{
//         socket.on("get-document", async documentId => {
//         const document = await findOrCreateDocument(documentId)
//         socket.join(documentId)
//         socket.emit("load-document", document.data)

//         socket.on("send-changes", delta => {
//             socket.broadcast.to(documentId).emit("receive-changes", delta)
//         })

//      socket.on("save-document", async data =>{
//         await Document.findByIdAndUpdate(documentId, { data })
//      })   
//     })
// })

io.on("connection", (socket) => {
    socket.on("get-document", async (documentId) => {
      const document =
        (await Document.findById(documentId)) ||
        (await Document.create({ _id: documentId, title: "Untitled", data: "" }));
      socket.join(documentId);
      socket.emit("load-document", document);
  
      socket.on("send-changes", (delta) => {
        socket.broadcast.to(documentId).emit("receive-changes", delta);
      });
      
      socket.on("update-title", (newTitle) => {
        socket.broadcast.to(documentId).emit("title-update", newTitle); // Broadcast title updates
      });
      
      socket.on("save-document", async ({ data, title }) => {
        await Document.findByIdAndUpdate(documentId, { data, title });
      });
    });
});

async function findOrCreateDocument(id, deltaObject){
    // if(id == null) return

    // const document = await Document.findById(id)
    // if(document) return document
    // return await Document.create({_id: id, data: defaultValue})

    if (!id) return null; // Ensure early exit if id is null or undefined

    // Try finding the document by ID
    let document = await Document.findById(id);
    if (document) return document;

    // If not found, create a new document
    const defaultValue = ""; // Replace with your default data value
    document = new Document({ _id: id, data: deltaObject });
    await document.save(); // Explicitly save the document
    return document;
 }
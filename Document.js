// const { Schema, model } = require("mongoose")

// const Document = new Schema({
//     _id: String,
//     data: Object
// })

// module.exports = model("Document", Document)

const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    _id: String,        // Ensure `_id` is a string
    title: String,
    data: mongoose.Schema.Types.Mixed        // Allow mixed data type (objects, arrays, etc.)
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;

// const mongoose = require('mongoose');

// const documentSchema = new mongoose.Schema({
//   title: { type: String, default: 'Untitled Document' },
//   data: { type: String, default: '' },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// });

// module.exports = mongoose.model('Document', documentSchema);


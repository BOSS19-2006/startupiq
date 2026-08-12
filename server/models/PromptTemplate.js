const mongoose = require('mongoose');

const promptTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    defaultContent: { type: String, required: true },
    version: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromptTemplate', promptTemplateSchema);

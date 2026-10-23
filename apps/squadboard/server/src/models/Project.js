import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    columns: {
      type: [columnSchema],
      default: [
        { key: 'backlog', title: 'Backlog', order: 0 },
        { key: 'todo', title: 'To Do', order: 1 },
        { key: 'doing', title: 'In Progress', order: 2 },
        { key: 'review', title: 'Review', order: 3 },
        { key: 'done', title: 'Done', order: 4 },
      ],
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);

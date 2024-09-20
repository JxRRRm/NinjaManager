// src/components/TaskDetailPanel.js
import React from 'react';
import './../css/TaskDetailPanel.css';

const TaskDetailPanel = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="task-detail-panel">
      <button className="close-btn" onClick={onClose}>Close</button>
      <p><strong>ID:</strong> NM-{task.id}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      <p><strong>Title:</strong> {task.title}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Due Date:</strong> {new Date(task.date).toLocaleString()}</p>
      <p><strong>Assigned To:</strong> {task.assignedEmployees?.join(', ') || 'N/A'}</p>
      <p><strong>Description:</strong> {task.description || 'No description available'}</p>
    </div>
  );
};

export default TaskDetailPanel;

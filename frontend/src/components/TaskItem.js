import React, { useState, useEffect } from 'react';
import './../css/TaskItem.css';
import PropTypes from 'prop-types';

const TaskItem = ({ task, onClose, isChecked, onCheckboxChange, showAllCheckboxes  }) => {
  const [selectedCategory, setCategory] = useState('');
  const [assignedEmployees, setAssignedEmployees] = useState([]);

  // Handle task deletion and send to backend
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent click from bubbling to the parent

    try {
      // Send the DELETE request to the backend
      const response = await fetch(`http://localhost:4000/api/tasks/delete/${task._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Notify the parent component that the task has been deleted
      onClose(task._id); // Pass the task ID to the parent to remove it from the UI
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
// Handle status change and send to backend
const handleStatusChange = async (e) => {
  e.stopPropagation(); // Prevent click from bubbling to the parent
  const newStatus = e.target.value;
  
  // Optimistically update the UI (optional)
  task.status = newStatus; 

  try {
    // Send the PATCH request to update the task status in the backend
    const response = await fetch(`http://localhost:4000/api/tasks/${task._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task status');
    }

    const updatedTask = await response.json();
    console.log('Task status updated:', updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    // Optionally, you could revert the UI change here if the request fails
  }
};


  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Prevent click from bubbling to the parent
    onCheckboxChange(e.target.checked); // Call the handler passed from the parent component
  };


  useEffect(() => {
    const fetchAssignedEmployees = async () => {
      if (task.employees?.length) {
        const employeeNames = await Promise.all(task.employees.map(async (id) => {
          try {
            const response = await fetch(`http://localhost:4000/api/user/${id}`);
            const data = await response.json();
            return `${data.fname} ${data.lname}`;
          } catch (error) {
            console.error(error);
            return 'Deleted User';
          }
        }));
        setAssignedEmployees(employeeNames);
      }
    };

    fetchAssignedEmployees();
  }, [task.employees]);

  return (
    <div className="task-item">
      <input
        className={`hidden-checkbox ${showAllCheckboxes ? 'visible' : ''}`} // Apply a class to show checkbox
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      <p className="id">NM-{task.id}</p>
      <p className="priority">{task.priority}</p>
      <p className="task">{task.title}</p>
      <select id="category" className="category" value={selectedCategory} onChange={(e) => setCategory(e.target.value)}>
        <option value=""></option>
        <option value=""></option>
      </select>
      <select 
        className="status"
        value={task.status} 
        onChange={handleStatusChange} // Call the handler function when the status is changed
      >
        <option value="TODO">TODO</option>
        <option value="IN PROGRESS">IN PROGRESS</option>
        <option value="DONE">DONE</option>
      </select>
      <p className="assignee">{assignedEmployees.join(', ') || 'N/A'}</p>
      <button type="button" 
        className="material-symbols-outlined" 
        onClick={handleDelete} // Call handleDelete on click 
      >
        <span>delete</span>
      </button>
    </div>
  );
};

TaskItem.propTypes = {
  task: PropTypes.object.isRequired,
  isChecked: PropTypes.bool.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  showAllCheckboxes: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired, // Update onClose to pass task ID for deletion
};

export default TaskItem;

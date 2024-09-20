import React, { useState, useEffect } from 'react';
import { useTasksContext } from '../../hooks/useTasksContext';
import '../../css/TaskForm.css';
import { useCustomFetch } from '../../hooks/useCustomFetch';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import { useAuthContext } from '../../hooks/useAuthContext';
import moment from 'moment-timezone'; // Ensure moment-timezone is correctly imported

const TaskForm = () => {
  const { dispatch } = useTasksContext();
  const customFetch = useCustomFetch();
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { user } = useAuthContext();// Ensure user is destructured here
  const [createdBy, updatedBy] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user) return;

      try {
        // Update the fetch URL to include the correct port
        const response = await fetch('http://localhost:4000/api/user/employees', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const employeesData = await response.json();
                        // Do something with the fetched employees data, like setting state
        setEmployees(employeesData);
      } catch (error) {
        console.error(error);
        setError(error.message || 'Failed to fetch employees');
      }
    };

    fetchEmployees();// Dependency array, if you're using the 'user' state to store user information
  }, [user]);

  useEffect(() => {
  }, [selectedEmployees]); // This useEffect will run every time selectedEmployees changes

  // Convert the local date and time to a UTC string
  const convertToUTC = (localDateTime) => {
    // Directly return the localDateTime if it's empty, letting the backend handle the missing date validation
    if (!localDateTime) {
      return localDateTime;
    }

    // Convert the local date and time to a UTC string for non-empty dates
    return moment(localDateTime, 'YYYY-MM-DDTHH:mm').tz('America/Los_Angeles').utc().format();
  };  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert the date; this will either pass through the empty value or convert a valid date to UTC
    const utcDate = convertToUTC(date);
  
    const task = {
      title,
      date: utcDate, 
      description,
      priority,
      employees: selectedEmployees,
    };
  
    try {
      const json = await customFetch('/api/tasks', 'POST', task);
      dispatch({ type: 'CREATE_TASK', payload: json });

      setSuccessMessage("Task Created");

      setTimeout(() => setSuccessMessage(''), 2500);
  
      // Reset form fields and state after successful task creation
      setTitle('');
      setDate('');
      setDescription('');
      setPriority('');
      setSelectedEmployees([]);
      setError(null); // Clear any existing errors

    } catch (error) {
      console.error("Error creating task:", error);
      if (error.message.includes('Unauthorized')) {
        logout();
        navigate('/login');
      } else {
        // Directly use the error message returned from the customFetch
        setError(error.message);
        setSuccessMessage('');
      }
    }
  };          

const handleTitleChange = (e) => {
  setTitle(e.target.value);
};

const handleDateChange = (e) => {
  setDate(e.target.value);
};

const handlePriorityChange = (e) => {
  setPriority(e.target.value);
};

const handleDescriptionChange = (e) => {
  setDescription(e.target.value);
};

// Handler to add selected employee to the task
const handleAddEmployee = () => {

  // Check if the currentEmployee is already in the selectedEmployees array
  if (currentEmployee && !selectedEmployees.includes(currentEmployee)) {
    // Update the state in a functional way to ensure the latest state is used
    setSelectedEmployees(prevSelectedEmployees => {
    // Create a new array for the updated state to avoid direct mutations
    const updatedSelectedEmployees = [...prevSelectedEmployees, currentEmployee];
    return updatedSelectedEmployees;
  });
    // Clear the current selection after adding the employee to the list
    setCurrentEmployee('');
  } else {
    console.log("Employee already added or no employee selected.");
  }
};


// Handler for currentEmployee state change
const handleCurrentEmployeeChange = (e) => {
setCurrentEmployee(e.target.value);
};

// Handler to remove selected employee from the task
const handleRemoveEmployee = (employeeId) => {
setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
};


return (
<div>
  <form className="create" onSubmit={handleSubmit}>
      <h3>Create Task</h3>

      <label>Task Title:</label>
      <input
          type="text"
          onChange={handleTitleChange}
          value={title}
          //className={emptyFields.includes('title') ? 'error' : ''}
      />

      <label>Due Date:</label>
      <input 
          type="datetime-local"
          onChange={handleDateChange} 
          value={date}
          //className={emptyFields.includes('date') ? 'error' : ''}
      />

      <label>Priority:</label>
      <select
          onChange={handlePriorityChange}
          value={priority}
      >
          <option value="-">Select Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
      </select>

      <label>Assign Employee:</label>
      <select value={currentEmployee} onChange={handleCurrentEmployeeChange}>
          <option value="">Select Employee</option>
          {employees.map(employee => (
              <option key={employee._id} value={employee._id}>
                  {employee.fname} {employee.lname}
              </option>
          ))}
      </select>
      <button type="button" onClick={handleAddEmployee}>Add Employee</button>

      {/* List of selected employees with a remove button */}
      {selectedEmployees.map(employeeId => {
          const employee = employees.find(e => e._id === employeeId);
          return (
              <div key={employeeId} className="selectedEmployee">
                  <span>{employee ? `${employee.fname} ${employee.lname}` : 'Loading...'}</span>
                  <button type="button" onClick={() => handleRemoveEmployee(employeeId)}>
                      Remove
                  </button>
              </div>
          );
      })}

      <label>Description:</label>
      <textarea
          rows="10"
          onChange={handleDescriptionChange}
          value={description}
      ></textarea>

      <button type="submit">Submit</button>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="task-form-error">{error}</div>}
  </form>
</div>
);

};

export default TaskForm;
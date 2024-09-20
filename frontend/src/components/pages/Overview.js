// src/components/Overview.js
import React, { useState, useEffect } from "react";
import '../../css/Overview.css'; // Import CSS file
import editIcon from '../../images/edit_icon.png';
import { useTasksContext } from "../../hooks/useTasksContext"; 
import { useNavigate } from 'react-router-dom';
import { useCustomFetch } from '../../hooks/useCustomFetch';
import { useLogout } from '../../hooks/useLogout';
import moment from 'moment-timezone';
import { useAuthContext } from '../../hooks/useAuthContext';
import FiltersBar from '../FiltersBar'; // Import the FiltersBar component

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const Overview = () => {
  const [priorityLevel, setPriorityLevel] = useState("All");
  const [status, setStatus] = useState("All");
  const [dueDate, setDueDate] = useState("");
  const [searchBar, setSearch] = useState("");
  const { tasks, dispatch } = useTasksContext(); 
  const customFetch = useCustomFetch(); 
  const navigate = useNavigate(); 
  const { logout } = useLogout(); 
  const [employeeNamesMap, setEmployeeNamesMap] = useState({});
  const { user } = useAuthContext();
  const [completedStates, setCompletedStates] = useState(new Map()); // Initialize completedStates

  const isPastDue = (date) => new Date(date) < new Date();

  const fetchEmployeeNames = async (employeeIds) => {
    const details = await Promise.all(employeeIds.map(async (id) => {
      try {
        const response = await fetch(`http://localhost:4000/api/user/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (!response.ok) throw new Error('Could not fetch employee details');
        const data = await response.json();
        return { name: `${data.fname} ${data.lname}`, email: data.email };
      } catch (error) {
        console.error(error);
        return { name: 'Deleted User', email: 'Deleted Email' };
      }
    }));
    return details.reduce((acc, curr, index) => {
      acc[employeeIds[index]] = curr;
      return acc;
    }, {});
  };

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const allEmployeeIds = tasks.reduce((acc, task) => {
        task.employees.forEach(id => {
          if (!acc.includes(id)) {
            acc.push(id);
          }
        });
        return acc;
      }, []);
  
      fetchEmployeeNames(allEmployeeIds).then(setEmployeeNamesMap);
    }
  }, [tasks]); // Make sure to include tasks as a dependency

  useEffect(() => {
    const fetchAndUpdateTasks = async () => {
      try {
        const json = await customFetch('/api/tasks');
        const updatedTasks = json.map(task => ({
          ...task,
          status: isPastDue(task.date) ? 'Past Due' : task.status
        }));
        dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        if (error.message === 'Unauthorized') {
          logout(); 
          navigate('/login'); 
        }
      }
    };

    fetchAndUpdateTasks();

    const intervalId = setInterval(fetchAndUpdateTasks, 60000);

    return () => clearInterval(intervalId);
  }, [customFetch, dispatch, logout, navigate]);

  const filterTasks = () => {
    return tasks.filter(task => {
      const priorityMatch = priorityLevel === 'All' || task.priority.toLowerCase() === priorityLevel.toLowerCase();
      const statusMatch = status === 'All' || task.status.toLowerCase() === status.toLowerCase();
      const dueDateMatch = !dueDate || moment.utc(task.date).tz('America/Los_Angeles').format('YYYY-MM-DD') === dueDate;
      const searchMatch = searchBar === '' || task.title.toLowerCase().includes(searchBar.toLowerCase());
      const notCompleted = !task.completed; // Check if task is not completed
      const notDeleted = !task.deleted; // Check if task is not deleted
    return priorityMatch && statusMatch && dueDateMatch && searchMatch && notCompleted && notDeleted;
    });
  };

  const handleButtonClick = async (taskId) => {
    try {
      const response = await customFetch(`/api/tasks/complete-task/${taskId}`, 'PATCH');
      const json = await response.json();
      dispatch({ type: 'UPDATE_TASK', payload: json });
      
      setCompletedStates(prevStates => new Map(prevStates).set(taskId, true)); // Update the state for completed tasks
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditTask = (taskId) => {
    navigate(`/editTask/${taskId}`);
  };

  return (
    <div className='Overview' style={{ paddingBottom: "4rem" }}>
      <div className="page-title"> 
        <h2>Overview</h2>
        <FiltersBar
          selectedPriority={priorityLevel}
          setSelectedPriority={setPriorityLevel}
          selectedStatus={status}
          setSelectedStatus={setStatus}
          selectedDueDate={dueDate}
          setSelectedDueDate={setDueDate}
          searchTerm={searchBar}
          setSearchTerm={setSearch}
          resetFilters={() => {
            setPriorityLevel("All");
            setStatus("All");
            setDueDate("");
            setSearch("");
          }}
        />
      </div>

      <div className="additional-boxes">
        {filterTasks().map((task, index) => (
          <div className="task-box" key={task._id}>
            <div className="box1">
              <p> <b># Task {index + 1} - {task.title}</b></p>
            </div>
            <div className="box1">
              <div className={`little-box1 ${isPastDue(task.date) ? 'past-due-box' : 'in-progress-box'}`}>
                Status - {task.status}
              </div>
              <div className={`little-box1 ${task.priority === 'High' ? 'high-priority-box' : task.priority === 'Medium' ? 'medium-priority-box' : 'low-priority-box'}`}>
                Priority - {task.priority}
              </div>
              <div className="little-box1">
                Due Date {formatDate(task.date)}
              </div>
            </div>
            <button
              className={`box2`}
              onClick={() => handleButtonClick(task._id)}
            >
              <div className={`little-box2 ${completedStates.get(task._id) ? 'completed' : ''}`}>
                <b>{completedStates.get(task._id) ? 'Completed' : 'Mark Complete'}</b>
              </div>
            </button>
            <div className="box">
              <div className="little-box" style={{ wordWrap: 'break-word', overflowY: 'auto' }}>
                <p><b>Assigned Employee(s):</b></p>
                {task.employees && task.employees.length > 0 ? (
                  task.employees.map(id => (
                    <div key={id}>
                      {employeeNamesMap[id] ? (
                        <>
                          <p>Name: {employeeNamesMap[id].name}</p>
                        </>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No one assigned</p>
                )}
              </div>

              <div className="little-box" style={{ wordWrap: 'break-word', overflowY: 'auto' }}>
                <p><b>Task Description:</b></p>
                <p>{task.description}</p>
              </div>
              <div className="little-box" style={{ wordWrap: 'break-word', overflowY: 'auto' }}>
                <p><b>Edit History:</b></p>
                <p><b>- Task was created on</b> {new Date(task.createdAt).toLocaleString()} <b>by:</b> {task.createdBy ? `${task.createdBy.fname} ${task.createdBy.lname}` : 'a user that no longer exists'}</p>
                
                {task.updatedAt > task.createdAt ? (
                  <p><b>- Task was last edited on</b> {new Date(task.updatedAt).toLocaleString()} <b>by:</b> {task.updatedBy ? `${task.updatedBy.fname} ${task.updatedBy.lname}` : 'a user that no longer exists'}</p>
                ) : (
                  <p><b>- Task has not been edited</b></p>
                )}

                {task.history && (
                  <div>
                    {task.history.split('\n').map((entry, index) => (
                      <p key={index}>{entry}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="edit-button">
                <button
                  style={{ backgroundImage: `url(${editIcon})` }}
                  onClick={() => handleEditTask(task._id)}
                ></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;

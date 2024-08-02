// src/pages/History.js
import React, { useState, useEffect } from "react";
import '../../css/History.css'; // Import CSS file
import { useTasksContext } from "../../hooks/useTasksContext"
import editIcon from '../../images/trash_icon.png';
import { useNavigate } from 'react-router-dom';
import { useCustomFetch } from '../../hooks/useCustomFetch';
import { useLogout } from '../../hooks/useLogout';
import moment from 'moment-timezone';
import { useAuthContext } from '../../hooks/useAuthContext';
import FiltersBar from "../FiltersBar";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1; // adjust for zero-indexed months
  const year = date.getFullYear();
  return `${month}/${day}/${year}`; // mm/dd/yyyy
};

const History = () => {
  const [priorityLevel, setPriorityLevel] = useState("All");
  const [status, setStatus] = useState("All");
  const [dueDate, setDueDate] = useState("");
  const [searchBar, setSearch] = useState("");
  const [employeeNamesMap, setEmployeeNamesMap] = useState({});
  const { user } = useAuthContext();
  const { tasks, dispatch } = useTasksContext()
  const navigate = useNavigate();
  const customFetch = useCustomFetch();
  const { logout } = useLogout();

  const deleteClick = async (task) => {
    try {
      await customFetch('/api/tasks/' + task._id, 'DELETE');
      dispatch({ type: 'DELETE_TASK', payload: { _id: task._id } });
    } catch (error) {
      console.error("Error during task deletion:", error);
      if (error.message === 'Unauthorized') {
        logout();
        navigate('/login');
      }
    }
  };

  const restoreCompletedClick = async (task) => {
    try {
      const response = await customFetch(`/api/tasks/mark-task-restore-completed/${task._id}`, 'PATCH');
      const json = await response.json();
      dispatch({ type: 'UPDATE_TASK', payload: json });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filterTasks = () => {
    return tasks.filter(task => {
      const priorityMatch = priorityLevel === 'All' || task.priority.toLowerCase() === priorityLevel.toLowerCase();
      const statusMatch = status === 'All' || (status === 'Complete' && task.completed) || (status === 'Deleted' && task.deleted);
      const dueDateMatch = !dueDate || moment.utc(task.date).tz('America/Los_Angeles').format('YYYY-MM-DD') === dueDate;
      const searchMatch = searchBar === '' || task.title.toLowerCase().includes(searchBar.toLowerCase());
      const isCompleteOrDeleted = task.completed || task.deleted; // Only include completed tasks
      return priorityMatch && statusMatch && dueDateMatch && searchMatch && isCompleteOrDeleted;
    });
  };

  return (
    <div className='History'>
      <div className="page-title">
        <h2>History</h2>
      </div>

      <FiltersBar
        tasks={tasks}
        setEmployeeNamesMap={setEmployeeNamesMap}
        priorityLevel={priorityLevel}
        setPriorityLevel={setPriorityLevel}
        status={status}
        setStatus={setStatus}
        dueDate={dueDate}
        setDueDate={setDueDate}
        searchBar={searchBar}
        setSearch={setSearch}
      />

      <div className="additional-boxes">
        {filterTasks().map((task, index) => (
          <div className="task-box" key={task._id}>
            <div className="box2"></div>
            <div className="box1">
              <p><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Task - {index + 1} {task.title}</b></p>
            </div>
            <div className="box1">
              <div className={`little-box1 ${
                task.priority === 'High' ? 'high-priority-box' :
                task.priority === 'Medium' ? 'medium-priority-box' :
                task.priority === 'Low' ? 'low-priority-box' : '' // No class added if priority is null
              }`}>
                Priority - {task.priority || 'None'}
              </div>

              <div className="little-box1">
                Due Date {formatDate(task.date)}
              </div>
            </div>
            <div className="box2">
              {task.completed ? (
                <div className="completed-box">
                  <button className="restore-completed" onClick={() => restoreCompletedClick(task)}>Restore</button>
                </div>
              ) : null}
            </div>
            <div className="box">
              <div className="little-box">
                <p><b>Assigned Employee(s):</b></p>
                {task.employees && task.employees.length > 0 ? (
                  task.employees.map(id => (
                    <div key={id}>
                      {employeeNamesMap[id] ? (
                        <>
                          <p>Name: {employeeNamesMap[id].name}</p>
                          <p>Email: {employeeNamesMap[id].email}</p>
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
                <p><b>Task Description:</b> {task.description}</p>
              </div>
              <div className="little-box">
                <p><b>- Task was created on</b> {new Date(task.createdAt).toLocaleString()} <b>by:</b> {task.createdBy ? `${task.createdBy.fname} ${task.createdBy.lname}` : 'Unknown'}</p>
                <p><b>- Task was last edited on</b> {new Date(task.updatedAt).toLocaleString()} <b>by:</b> {task.updatedBy ? `${task.updatedBy.fname} ${task.updatedBy.lname}` : 'Unknown'}</p>
                {task.history && (
                  <div>
                    {task.history.split('\n').map((entry, index) => (
                      <p key={index}>{entry}</p>
                    ))}
                  </div>
                )}
              </div>
              {user.role !== 'employee' && (
                <div className="edit-button">
                  <button
                    style={{ backgroundImage: `url(${editIcon})` }}
                    onClick={() => deleteClick(task)}
                  ></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;

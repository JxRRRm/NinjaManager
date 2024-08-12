import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import TaskForm from './TaskForm';
import { TasksContextProvider } from '../context/TasksContext';
import { AuthContextProvider } from '../context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import moment from 'moment-timezone';

jest.mock('../hooks/useCustomFetch', () => ({
  useCustomFetch: jest.fn().mockImplementation(() => {
    return (url, method = 'GET', data = null) => {
      return new Promise((resolve, reject) => {
        if (method === 'POST' && url === '/api/tasks') {
          if (!data.title || !data.date || !data.description || !data.priority) {
            // Combine errors into a single message string
            const errors = [];
            if (!data.title) errors.push("The title field is required.");
            if (!data.date) errors.push("Please provide a due date for the task.");
            if (!data.description) errors.push("A task description is required.");
            if (!data.priority) errors.push("Please select a priority level for the task.");
            reject(new Error(errors.join(' ')));  // Combining errors into one string
          } else {
            resolve({ message: 'Task Created' });
          }
        } else {
          resolve({});  // Default resolve for other cases
        }
      });
    };
  })
}));

//setup function provides all neccessary context providers
const setup = () => render(
  <Router>
    <AuthContextProvider>
      <TasksContextProvider>
        <TaskForm />
      </TasksContextProvider>
    </AuthContextProvider>
  </Router>
);

// Helper function to fill in the form
const fillForm = async (getByLabelText, getByRole, { title = '', date = '', description = '', priority = '' }) => {
  const titleInput = getByLabelText('Task Title:');
  const dateInput = getByLabelText('Due Date:');
  const descriptionInput = getByLabelText('Description:');
  const prioritySelect = getByLabelText('Priority:');
  const submitButton = getByRole('button', { name: /submit/i });

  await act(async () => {
    fireEvent.change(titleInput, { target: { value: title } });
    fireEvent.change(dateInput, { target: { value: date } });
    fireEvent.change(descriptionInput, { target: { value: description } });
    fireEvent.change(prioritySelect, { target: { value: priority } });
    fireEvent.click(submitButton);
  });
};

// Define a constant for the combined error message
const combinedErrorMessage = "The title field is required. Please provide a due date for the task. " + 
"A task description is required. Please select a priority level for the task.";

/* The test checks if TaskForm can handle and display errors when the API (as simulated by the mock) 
indicates that required fields are missing. By simulating an error response from the API when required fields are missing, 
the test indirectly checks whether the form validates input fields and correctly handles error states. 
The presence of the console error in the output is part of the expected behavior when the mocked fetch
function rejects the submission due to validation failures.
*/

describe('TaskForm API Interaction', () => { //ok

  test('displays error when title is missing', async () => {
    const { getByLabelText, getByRole, findByText } = setup();
  
    await fillForm(getByLabelText, getByRole, {
      title: '',
      date: '2024-12-25T12:00',
      description: 'Complete this task soon.',
      priority: 'High'
    });
  
    expect(await findByText(/title field is required/i)).toBeInTheDocument();
  });  

  test('displays error when date is missing', async () => {
    const { getByLabelText, getByRole, findByText } = setup();
  
    await fillForm(getByLabelText, getByRole, {
      title: 'New Task',
      date: '',
      description: 'Complete this task soon.',
      priority: 'High'
    });
  
    expect(await findByText(/provide a due date for the task/i)).toBeInTheDocument();
  });

  test('displays error when description is missing', async () => {
    const { getByLabelText, getByRole, findByText } = setup();
  
    await fillForm(getByLabelText, getByRole, {
      title: 'New Task',
      date: '2024-12-25T12:00',
      description: '',
      priority: 'High'
    });
  
    expect(await findByText(/task description is required/i)).toBeInTheDocument();
  });

  test('displays error when priority is missing', async () => {
    const { getByLabelText, getByRole, findByText } = setup();
  
    await fillForm(getByLabelText, getByRole, {
      title: 'New Task',
      date: '2024-12-25T12:00',
      description: 'Complete this task soon.',
      priority: ''
    });
  
    expect(await findByText(/select a priority level for the task/i)).toBeInTheDocument();
  });  

  test('submits the form successfully and displays a success message', async () => {
    const { getByLabelText, getByRole, findByText } = setup();
    const testDate = moment().tz('America/Los_Angeles').add(1, 'days').format('YYYY-MM-DDTHH:mm');

    // Use fillForm helper to fill in the form with valid data
    await fillForm(getByLabelText, getByRole, {
      title: 'New Task',
      date: testDate,
      description: 'Complete this task soon.',
      priority: 'High'
    });

    // Expect to find a success message
    expect(await findByText('Task Created')).toBeInTheDocument();
  });  

  test('fails to create task when all required fields are missing and displays combined error messages', async () => {
    const { getByLabelText, getByRole, findByText } = setup();

    // Use fillForm helper to submit an empty form
    await fillForm(getByLabelText, getByRole, {
      title: '',
      date: '',
      description: '',
      priority: ''
    });

    // Check for combined error messages
    expect(await findByText(combinedErrorMessage)).toBeInTheDocument();
  });
});





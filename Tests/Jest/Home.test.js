import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Import extend-expect to use toBeInTheDocument
import Home from './Home';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TasksContext } from '../context/TasksContext';


const mockDispatch = jest.fn();

// Define your mock user and tasks
const mockUser = {
  _id: "661074dfcadf3d75882c5bc0",
  fname: "John",
  lname: "Doe",
  email: "owner@gmail.edu",
  password: "$2b$10$eauToN8OV8yLUD9OzyeHRuBOxtD.fJxihklkBgwgWULro7eIMhL5O", // Replace with an actual hash or placeholder
  role: "owner",
  verified: true,
  owner: true
};

describe('Home component tests', () => {
    const mockOnClose = jest.fn(); // Add this line
  
    it.skip('renders TaskDetails for each task', async () => {
      const mockTasks = [
        { _id: '1', title: 'Test Task In Progress', status: 'In Progress' },
        { _id: '2', title: 'Test Task Past Due', status: 'Past Due' }
      ];
  
      render(
        <Router>
          <AuthContext.Provider value={{ user: mockUser }}>
            <TasksContext.Provider value={{ tasks: mockTasks, dispatch: mockDispatch }}>
              <Home onClose={mockOnClose} /> {/* Pass it here */}
            </TasksContext.Provider>
          </AuthContext.Provider>
        </Router>
      );
  
      await waitFor(() => {
        expect(screen.getByTitle('Test Task In Progress')).toBeInTheDocument();
        expect(screen.getByTitle('Test Task Past Due')).toBeInTheDocument();
      });
    });
    // high priority filter
    it.skip('renders only high priority tasks when high priority is selected', async () => {
      const mockTasks = [
        { _id: '1', title: 'High Priority Task', status: 'In Progress', priority: 'high' },
        { _id: '2', title: 'Low Priority Task', status: 'Past Due', priority: 'low' }
      ];
  
      const { getByText, getByLabelText, queryByText } = render(
        <Router>
          <AuthContext.Provider value={{ user: mockUser }}>
            <TasksContext.Provider value={{ tasks: mockTasks, dispatch: mockDispatch }}>
              <Home onClose={mockOnClose} /> {/* Pass it here */}
            </TasksContext.Provider>
          </AuthContext.Provider>
        </Router>
      );
  
      const prioritySelect = getByLabelText('Priority:');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
  
      await waitFor(() => {
        expect(getByText('High Priority Task')).toBeInTheDocument();
        expect(queryByText('Low Priority Task')).not.toBeInTheDocument();
      });
    });
    // medium priority filter
    it.skip('renders only medium priority tasks when medium priority is selected', async () => {
        const mockTasks = [
          { _id: '1', title: 'Medium Priority Task', status: 'In Progress', priority: 'medium' },
          { _id: '2', title: 'Low Priority Task', status: 'Past Due', priority: 'low' }
        ];
    
        const { getByText, getByLabelText, queryByText } = render(
          <Router>
            <AuthContext.Provider value={{ user: mockUser }}>
              <TasksContext.Provider value={{ tasks: mockTasks, dispatch: mockDispatch }}>
                <Home onClose={mockOnClose} /> {/* Pass it here */}
              </TasksContext.Provider>
            </AuthContext.Provider>
          </Router>
        );
    
        const prioritySelect = getByLabelText('Priority:');
        fireEvent.change(prioritySelect, { target: { value: 'medium' } });
    
        await waitFor(() => {
          expect(getByText('Medium Priority Task')).toBeInTheDocument();
          expect(queryByText('Low Priority Task')).not.toBeInTheDocument();
        });
      });
    // low priority filter
    it.skip('renders only low priority tasks when low priority is selected', async () => {
        const mockTasks = [
            { _id: '1', title: 'Low Priority Task', status: 'In Progress', priority: 'low' },
            { _id: '2', title: 'Medium Priority Task', status: 'Past Due', priority: 'medium' }
        ];

        const { getByText, getByLabelText, queryByText } = render(
            <Router>
            <AuthContext.Provider value={{ user: mockUser }}>
                <TasksContext.Provider value={{ tasks: mockTasks, dispatch: mockDispatch }}>
                <Home onClose={mockOnClose} /> {/* Pass it here */}
                </TasksContext.Provider>
            </AuthContext.Provider>
            </Router>
        );

        const prioritySelect = getByLabelText('Priority:');
        fireEvent.change(prioritySelect, { target: { value: 'low' } });

        await waitFor(() => {
            expect(getByText('Low Priority Task')).toBeInTheDocument();
            expect(queryByText('Medium Priority Task')).not.toBeInTheDocument();
        });
    });

    // In Progress Status filter
    it.skip('renders only In Progress status tasks when In Progress is selected', async () => {
        const mockTasks = [
            { _id: '1', title: 'Low Priority Task', status: 'In Progress', priority: 'low' },
            { _id: '2', title: 'Medium Priority Task', status: 'Past Due', priority: 'medium' }
        ];

        const { getByText, getByLabelText, queryByText } = render(
            <Router>
            <AuthContext.Provider value={{ user: mockUser }}>
                <TasksContext.Provider value={{ tasks: mockTasks, dispatch: mockDispatch }}>
                <Home onClose={mockOnClose} /> {/* Pass it here */}
                </TasksContext.Provider>
            </AuthContext.Provider>
            </Router>
        );

        const prioritySelect = getByLabelText('Status:');
        fireEvent.change(prioritySelect, { target: { value: 'In Progress' } });

        await waitFor(() => {
            expect(getByText('Low Priority Task')).toBeInTheDocument();
            expect(queryByText('Medium Priority Task')).not.toBeInTheDocument();
        });
    });

    // Past Due Status filter
    it.skip('renders only Past Due status tasks when Past Due is selected', async () => {
        const mockTasks = [
            { _id: '1', title: 'Low Priority Task', status: 'Past Due', priority: 'low' },
            { _id: '2', title: 'Medium Priority Task', status: 'In Progress', priority: 'medium' }
        ];

        const { getByText, getByLabelText, queryByText } = render(
            <Router>
            <AuthContext.Provider value={{ user: mockUser }}>
                <TasksContext.Provider value={{ tasks: mockTasks, dispatch: mockDispatch }}>
                <Home onClose={mockOnClose} /> {/* Pass it here */}
                </TasksContext.Provider>
            </AuthContext.Provider>
            </Router>
        );

        const prioritySelect = getByLabelText('Status:');
        fireEvent.change(prioritySelect, { target: { value: 'Past Due' } });

        await waitFor(() => {
            expect(getByText('Low Priority Task')).toBeInTheDocument();
            expect(queryByText('Medium Priority Task')).not.toBeInTheDocument();
        });
    });


    // Due Date filter
    it('renders the tasks with specific due date when selected', async () => {
        const mockTasks = [
            { _id: '1', title: 'Low Priority Task', status: 'Past Due', priority: 'low', date: '28 May 2024 05:00 PM'},
            { _id: '2', title: 'Medium Priority Task', status: 'In Progress', priority: 'medium', date: '15 May 2024 05:00 PM'}
        ];

        const { getByText, getByLabelText, queryByText } = render(
            <Router>
            <AuthContext.Provider value={{ user: mockUser }}>
                <TasksContext.Provider value={{ tasks: mockTasks, dispatch: mockDispatch }}>
                <Home onClose={mockOnClose} /> {/* Pass it here */}
                </TasksContext.Provider>
            </AuthContext.Provider>
            </Router>
        );

        const dueDateSelect = getByLabelText('Due Date:');
        fireEvent.change(dueDateSelect, { target: { value: '2024-05-28' } }); // Update date format

        await waitFor(() => {
            expect(getByText('Low Priority Task')).toBeInTheDocument();
            expect(queryByText('Medium Priority Task')).not.toBeInTheDocument();
        });
    });
    
});
import React, { useState, useEffect, createContext, useContext, useReducer, useRef, useMemo, useCallback } from "react";

// Create the context directly in the App component
const ThemeContext = createContext();

// Define actions for the reducer
const ADD_TASK = "ADD_TASK";
const DELETE_TASK = "DELETE_TASK";
const UPDATE_TASK = "UPDATE_TASK";

// Define the reducer function to manage task state
const tasksReducer = (state, action) => {
  switch (action.type) {
    case ADD_TASK:
      return [...state, action.payload];
    case DELETE_TASK:
      return state.filter((task, index) => index !== action.payload);
    case UPDATE_TASK:
      return state.map((task, index) =>
        index === action.payload.index ? { ...task, ...action.payload.updatedTask } : task
      );
    default:
      return state;
  }
};

const TaskManager = () => {
  // Using useReducer to manage task state
  const [tasks, dispatch] = useReducer(tasksReducer, [], () => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false); // To track if we are editing a task
  const [editIndex, setEditIndex] = useState(null); // To track the index of the task being edited
  const [editTitle, setEditTitle] = useState(""); // To track edited title
  const [editDescription, setEditDescription] = useState(""); // To track edited description
  const { theme, toggleTheme } = useContext(ThemeContext);

  // useRef to store reference to the title input field
  const titleInputRef = useRef(null);

  // Save tasks to localStorage whenever the tasks state changes
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Auto-focus the title input field when the component mounts
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Function to add a task
  const addTask = () => {
    if (title.trim() && description.trim()) {
      const newTask = { title, description };
      dispatch({ type: ADD_TASK, payload: newTask });
      setTitle("");
      setDescription("");
      alert(`Task Added: ${newTask.title}`);
    }
  };

  // Memoizing delete task function using useCallback
  const deleteTask = useCallback((index) => {
    dispatch({ type: DELETE_TASK, payload: index });
  }, []);

  // Memoizing update task function using useCallback
  const updateTask = useCallback(() => {
    if (editTitle.trim() && editDescription.trim()) {
      const updatedTask = { title: editTitle, description: editDescription };
      dispatch({ type: UPDATE_TASK, payload: { index: editIndex, updatedTask } });
      setIsEditing(false);
      setEditIndex(null);
      setEditTitle("");
      setEditDescription("");
      alert(`Task Updated: ${updatedTask.title}`);
    }
  }, [editTitle, editDescription, editIndex]);

  // Function to start editing a task
  const startEditing = (index) => {
    setIsEditing(true);
    setEditIndex(index);
    setEditTitle(tasks[index].title);
    setEditDescription(tasks[index].description);
  };

  // Memoizing tasks to prevent unnecessary re-renders during filtering
  const filteredTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  return (
    <div
      style={{
        backgroundColor: theme === "light" ? "#fff" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        minHeight: "100vh",
        padding: "20px",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <h2>Task Manager</h2>
      <button
        onClick={toggleTheme}
        style={{
          padding: "10px 20px",
          margin: "10px 0",
          cursor: "pointer",
          border: "none",
          backgroundColor: theme === "light" ? "#007bff" : "#444",
          color: "#fff",
          borderRadius: "5px",
        }}
      >
        Toggle Theme
      </button>

      {/* Add Task Form */}
      {!isEditing ? (
        <>
          <input
            ref={titleInputRef} // Assign the ref to the title input field
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              width: "100%",
              maxWidth: "300px",
            }}
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              width: "100%",
              maxWidth: "300px",
            }}
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={addTask}
            style={{
              padding: "10px 20px",
              margin: "10px 0",
              cursor: "pointer",
              border: "none",
              backgroundColor: theme === "light" ? "#007bff" : "#444",
              color: "#fff",
              borderRadius: "5px",
            }}
          >
            Add Task
          </button>
        </>
      ) : (
        // Edit Task Form
        <>
          <input
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              width: "100%",
              maxWidth: "300px",
            }}
            type="text"
            placeholder="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <input
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              width: "100%",
              maxWidth: "300px",
            }}
            type="text"
            placeholder="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <button
            onClick={updateTask}
            style={{
              padding: "10px 20px",
              margin: "10px 0",
              cursor: "pointer",
              border: "none",
              backgroundColor: theme === "light" ? "#28a745" : "#555",
              color: "#fff",
              borderRadius: "5px",
            }}
          >
            Update Task
          </button>
          <button
            onClick={() => setIsEditing(false)}
            style={{
              padding: "10px 20px",
              margin: "10px 0",
              cursor: "pointer",
              border: "none",
              backgroundColor: "#dc3545",
              color: "#fff",
              borderRadius: "5px",
            }}
          >
            Cancel Edit
          </button>
        </>
      )}

      {/* Task List */}
      <ul>
        {filteredTasks.map((task, index) => (
          <li key={index}>
            <strong>{task.title}</strong>: {task.description}
            <button onClick={() => deleteTask(index)} style={{ marginLeft: "10px", color: "red" }}>
              Delete
            </button>
            <button
              onClick={() => startEditing(index)}
              style={{ marginLeft: "10px", color: "green" }}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <TaskManager />
    </ThemeContext.Provider>
  );
};

export default App;

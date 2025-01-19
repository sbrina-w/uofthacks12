import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaPlus, FaRegCircle, FaTrash } from 'react-icons/fa';
import styles from './TodoList.module.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/todos');
      const data = await response.json();
      setTodos(data.todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const response = await fetch('http://127.0.0.1:5000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodo.trim() })
      });
      
      const data = await response.json();
      if (data.todo) {
        setTodos(prev => [...prev, data.todo]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/todos/${id}`, {
        method: 'PUT'
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? { ...todo, done: data.done } : todo
        ));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/todos/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const completedCount = todos.filter(todo => todo.done).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  if (isLoading) {
    return (
      <div className={styles.todoCard}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.todoCard}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2>To-Do List</h2>
          <div className={styles.progress}>
            <span>{completedCount}/{totalCount}</span>
          </div>
        </div>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleAddTodo} className={styles.addForm}>
        <input
          type="text"
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.addButton}>
          <FaPlus />
        </button>
      </form>

      <div className={styles.todoList}>
        {todos.map((todo) => (
          <div 
            key={todo.id} 
            className={`${styles.todoItem} ${todo.done ? styles.done : ''}`}
          >
            <button 
              className={styles.checkButton}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.done ? <FaCheckCircle /> : <FaRegCircle />}
            </button>
            
            <span className={styles.todoText}>{todo.text}</span>
            
            <button 
              className={styles.deleteButton}
              onClick={() => deleteTodo(todo.id)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <div className={styles.emptyState}>
          <p>No todos yet. Add some tasks to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
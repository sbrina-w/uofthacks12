import React, { useState } from 'react';
import { FaCheckCircle, FaPlus, FaRegCircle, FaTrash } from 'react-icons/fa';
import styles from './TodoList.module.css';

const TodoList = ({ todos, setTodos }) => {
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: newTodo.trim(),
      done: false
    }]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(todo => todo.done).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div className={styles.todoCard}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2>Tasks</h2>
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
          placeholder="Add a new task..."
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
          <p>No tasks yet. Add some tasks to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
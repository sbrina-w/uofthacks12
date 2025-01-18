import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTrophy, 
  FaClock, 
  FaChartLine,
  FaPlus
} from 'react-icons/fa';
import styles from './App.module.css';
import ProductivityScore from './ProductivityScore';
import RecentActivity from './RecentActivity';
import TodoList from './/TodoList';
import Achievements from './Achievements';
import WeeklyStats from './WeeklyStats';

const App = () => {
  const [productivityData, setProductivityData] = useState({
    score: 85,
    trend: '+5%',
    recentActivities: [
      { id: 1, app: 'VS Code', duration: '2h 15m', timestamp: '2 hours ago' },
      { id: 2, app: 'Notion', duration: '45m', timestamp: '3 hours ago' },
      { id: 3, app: 'Slack', duration: '30m', timestamp: '4 hours ago' }
    ],
    weeklyStats: {
      coding: 75,
      meetings: 60,
      documentation: 45,
      planning: 80
    }
  });

  const [todos, setTodos] = useState([
    { id: 1, text: 'Complete project documentation', done: false },
    { id: 2, text: 'Review pull requests', done: true },
    { id: 3, text: 'Team sync meeting', done: false }
  ]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.date}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.topSection}>
          <ProductivityScore score={productivityData.score} trend={productivityData.trend} />
          <WeeklyStats data={productivityData.weeklyStats} />
        </div>

        <div className={styles.middleSection}>
          <RecentActivity activities={productivityData.recentActivities} />
          <TodoList todos={todos} setTodos={setTodos} />
        </div>

        <div className={styles.bottomSection}>
          <Achievements />
        </div>
      </main>
    </div>
  );
};

export default App;
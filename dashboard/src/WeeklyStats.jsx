import React from 'react';
import { FaChartBar, FaCode, FaUsers, FaBook, FaTasks } from 'react-icons/fa';
import styles from './WeeklyStats.module.css';

const getActivityIcon = (activity) => {
  switch (activity.toLowerCase()) {
    case 'coding':
      return <FaCode />;
    case 'meetings':
      return <FaUsers />;
    case 'documentation':
      return <FaBook />;
    case 'planning':
      return <FaTasks />;
    default:
      return <FaChartBar />;
  }
};

const WeeklyStats = ({ data }) => {
  const activities = Object.entries(data).map(([name, value]) => ({
    name,
    value,
    icon: getActivityIcon(name)
  }));

  return (
    <div className={styles.statsCard}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <FaChartBar />
        </div>
        <h2>Weekly Activity</h2>
      </div>

      <div className={styles.statsGrid}>
        {activities.map(({ name, value, icon }) => (
          <div key={name} className={styles.statItem}>
            <div className={styles.statHeader}>
              <div className={styles.activityIcon}>
                {icon}
              </div>
              <span className={styles.activityName}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
              <span className={styles.value}>{value}%</span>
            </div>
            
            <div className={styles.barContainer}>
              <div 
                className={styles.bar} 
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.insight}>
          Most productive activity: {
            activities.reduce((a, b) => a.value > b.value ? a : b).name
          }
        </span>
      </div>
    </div>
  );
};

export default WeeklyStats;
import React, { useState, useEffect } from 'react';
import { FaClock, FaListCheck } from 'react-icons/fa6';
import styles from './RecentActivity.module.css';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/get_tasks');
        const data = await response.json();
        setActivities(data.tasks);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
    // Refresh every 10 seconds
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.activityCard}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <FaClock />
        </div>
        <h2>Recent Activity</h2>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className={styles.activityItem}
            style={{ '--index': index }}  // For staggered animation
          >
            <div className={styles.appIcon}>
              <FaListCheck />
            </div>
            
            <div className={styles.activityInfo}>
              <div className={styles.appDetails}>
                <h3>{activity.task}</h3>
                <span className={styles.duration}>New Task</span>
              </div>
              <div className={styles.timestamp}>
                {new Date(activity.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div className={styles.timeBar}>
              <div 
                className={styles.timeProgress} 
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className={styles.emptyState}>
          <p>No recent activity</p>
        </div>
      )}

      <button className={styles.viewAllButton}>
        View All Activity
        <span className={styles.buttonArrow}>→</span>
      </button>
    </div>
  );
};

export default RecentActivity;
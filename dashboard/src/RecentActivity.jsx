import React, { useState, useEffect, useRef } from 'react';
import { 
  FaClock, 
  FaStar,
  FaCode,
  FaBookOpen,
  FaCoffee,
  FaEnvelope,
  FaFileAlt,
  FaCalendarCheck,
  FaLightbulb,
  FaClipboardList,
  FaTasks,
  FaUserEdit,
  FaComments,
  FaBug,
  FaChartLine,
  FaRocket
} from 'react-icons/fa';
import styles from './RecentActivity.module.css';

const TASK_ICONS = [
  FaCode,
  FaBookOpen,
  FaCoffee,
  FaEnvelope,
  FaFileAlt,
  FaCalendarCheck,
  FaLightbulb,
  FaClipboardList,
  FaTasks,
  FaUserEdit,
  FaComments,
  FaBug,
  FaChartLine
];

const TWO_MINUTES = 2 * 60 * 1000; // 2 minutes in milliseconds

const isNew = (timestamp) => {
  const now = new Date().getTime();
  const itemTime = new Date(timestamp).getTime();
  return now - itemTime < TWO_MINUTES;
};

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const iconMapRef = useRef(new Map());

  const getIconForTask = (taskId) => {
    if (!iconMapRef.current.has(taskId)) {
      const randomIndex = Math.floor(Math.random() * TASK_ICONS.length);
      iconMapRef.current.set(taskId, TASK_ICONS[randomIndex]);
    }
    return iconMapRef.current.get(taskId);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/get_tasks');
        const data = await response.json();
        
        const activitiesWithIcons = data.tasks.map(task => ({
          ...task,
          IconComponent: getIconForTask(task.id),
          isNew: isNew(task.timestamp)
        }));
        
        setActivities(activitiesWithIcons);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 2000);
    
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
        {activities.map((activity, index) => {
          const Icon = activity.isNew ? FaRocket : activity.IconComponent;
          return (
            <div 
              key={activity.id} 
              className={`${styles.activityItem} ${activity.isNew ? styles.latestActivity : ''}`}
              style={{ '--index': index }}
            >
              {activity.isNew && <div className={styles.newBadge}>New!</div>}
              <div className={styles.appIcon}>
                <Icon />
              </div>
              
              <div className={styles.activityInfo}>
                <div className={styles.appDetails}>
                  <h3>{activity.task}</h3>
                  <span className={styles.duration}>
                    {activity.isNew ? 'Just Added!' : 'Task'}
                  </span>
                </div>
                <div className={styles.timestamp}>
                  {new Date(activity.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
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
          );
        })}
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
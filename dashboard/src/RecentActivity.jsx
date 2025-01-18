import React from 'react';
import { FaClock, FaCode, FaNoteSticky, FaSlack } from 'react-icons/fa6';
import styles from './RecentActivity.module.css';

const getAppIcon = (appName) => {
  switch (appName.toLowerCase()) {
    case 'vs code':
      return <FaCode />;
    case 'notion':
      return <FaNoteSticky />;
    case 'slack':
      return <FaSlack />;
    default:
      return <FaClock />;
  }
};

const RecentActivity = ({ activities }) => {
  return (
    <div className={styles.activityCard}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <FaClock />
        </div>
        <h2>Recent Activity</h2>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.appIcon}>
              {getAppIcon(activity.app)}
            </div>
            
            <div className={styles.activityInfo}>
              <div className={styles.appDetails}>
                <h3>{activity.app}</h3>
                <span className={styles.duration}>{activity.duration}</span>
              </div>
              <div className={styles.timestamp}>{activity.timestamp}</div>
            </div>
            
            <div className={styles.timeBar}>
              <div 
                className={styles.timeProgress} 
                style={{ 
                  width: `${Math.min(parseInt(activity.duration), 180) / 180 * 100}%`
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      <button className={styles.viewAllButton}>
        View All Activity
        <span className={styles.buttonArrow}>→</span>
      </button>
    </div>
  );
};

export default RecentActivity;
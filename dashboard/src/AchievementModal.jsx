// AchievementModal.jsx
import React from 'react';
import { FaCode } from 'react-icons/fa';
import styles from './AchievementModal.module.css';

const AchievementModal = ({ achievement, onClose }) => {
  if (!achievement) return null;

  const progressPercentage = (achievement.progress / achievement.total) * 100;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <div className={styles.achievementIcon}>
            <FaCode className={styles.icon} />
            <div className={styles.glow} />
          </div>
          
          <h2 className={styles.title}>Achievement Progress!</h2>
          <h3 className={styles.achievementTitle}>{achievement.title}</h3>
          <p className={styles.description}>{achievement.description}</p>
          
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {achievement.progress}/{achievement.total}
            </span>
          </div>

          <button className={styles.closeButton} onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;

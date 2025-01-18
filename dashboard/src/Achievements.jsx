import React, { useState } from 'react';
import { 
  FaTrophy, 
  FaStar, 
  FaFire, 
  FaRocket, 
  FaClock,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import styles from './Achievements.module.css';

const achievements = [
  {
    id: 1,
    title: "Productivity Master",
    description: "Maintain 90% productivity for 5 consecutive days",
    icon: <FaTrophy />,
    progress: 80,
    total: 100,
    unlocked: true,
    color: "gold"
  },
  {
    id: 2,
    title: "Focus Champion",
    description: "Complete 3 hours of focused work without interruption",
    icon: <FaStar />,
    progress: 65,
    total: 100,
    unlocked: false,
    color: "purple"
  },
  {
    id: 3,
    title: "Streak Builder",
    description: "Maintain a 7-day productivity streak",
    icon: <FaFire />,
    progress: 100,
    total: 100,
    unlocked: true,
    color: "orange"
  },
  {
    id: 4,
    title: "Early Bird",
    description: "Start work before 8 AM for 5 consecutive days",
    icon: <FaClock />,
    progress: 40,
    total: 100,
    unlocked: false,
    color: "blue"
  },
  {
    id: 5,
    title: "Goal Crusher",
    description: "Complete all daily tasks for 3 consecutive days",
    icon: <FaRocket />,
    progress: 90,
    total: 100,
    unlocked: false,
    color: "green"
  }
];

const Achievement = ({ achievement }) => {
  const progressPercentage = (achievement.progress / achievement.total) * 100;
  
  return (
    <div className={`${styles.achievementCard} ${achievement.unlocked ? styles.unlocked : ''}`}>
      <div className={`${styles.achievementIcon} ${styles[achievement.color]}`}>
        {achievement.icon}
        {achievement.unlocked && <div className={styles.unlockedBadge} />}
      </div>
      
      <div className={styles.achievementInfo}>
        <h3>{achievement.title}</h3>
        <p>{achievement.description}</p>
        
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${progressPercentage}%`,
                background: `linear-gradient(90deg, var(--${achievement.color}-start), var(--${achievement.color}-end))`
              }}
            />
          </div>
          <span className={styles.progressText}>
            {achievement.progress}/{achievement.total}
          </span>
        </div>
      </div>
    </div>
  );
};

const Achievements = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const achievementsPerPage = 3;
  const totalPages = Math.ceil(achievements.length / achievementsPerPage);
  
  const currentAchievements = achievements.slice(
    currentPage * achievementsPerPage,
    (currentPage + 1) * achievementsPerPage
  );

  return (
    <div className={styles.achievementsSection}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.icon}>
            <FaTrophy />
          </div>
          <h2>Achievements</h2>
        </div>
        
        <div className={styles.navigation}>
          <button 
            className={styles.navButton}
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            <FaChevronLeft />
          </button>
          <span className={styles.pageIndicator}>
            {currentPage + 1}/{totalPages}
          </span>
          <button 
            className={styles.navButton}
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className={styles.achievementsGrid}>
        {currentAchievements.map((achievement) => (
          <Achievement key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

export default Achievements;
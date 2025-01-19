import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaStar, 
  FaFire, 
  FaRocket, 
  FaClock,
  FaUsers,
  FaLightbulb,
  FaCalendar,
  FaBrain,
  FaChartLine,
  FaCheckDouble,
  FaMedal,
  FaCode,
} from 'react-icons/fa';
import styles from './Achievements.module.css';
import AchievementModal from './AchievementModal';

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
  },
  {
    id: 6,
    title: "Team Player",
    description: "Collaborate on 10 team projects successfully",
    icon: <FaUsers />,
    progress: 70,
    total: 100,
    unlocked: false,
    color: "purple"
  },
  {
    id: 7,
    title: "Innovation Guru",
    description: "Propose and implement 5 process improvements",
    icon: <FaLightbulb />,
    progress: 60,
    total: 100,
    unlocked: false,
    color: "gold"
  },
  {
    id: 8,
    title: "Deadline Defender",
    description: "Complete 20 tasks before their deadlines",
    icon: <FaCalendar />,
    progress: 85,
    total: 100,
    unlocked: true,
    color: "blue"
  },
  {
    id: 9,
    title: "Growth Mindset",
    description: "Complete 5 professional development courses",
    icon: <FaBrain />,
    progress: 50,
    total: 100,
    unlocked: false,
    color: "green"
  },
  {
    id: 10,
    title: "Performance Peak",
    description: "Exceed quarterly targets for 2 consecutive quarters",
    icon: <FaChartLine />,
    progress: 95,
    total: 100,
    unlocked: true,
    color: "orange"
  },
  {
    id: 11,
    title: "Quality Champion",
    description: "Maintain 98% quality score for 30 days",
    icon: <FaCheckDouble />,
    progress: 75,
    total: 100,
    unlocked: false,
    color: "purple"
  },
  {
    id: 12,
    title: "Excellence Award",
    description: "Receive 3 peer recognition awards",
    icon: <FaMedal />,
    progress: 30,
    total: 100,
    unlocked: false,
    color: "gold"
  },
  {
    id: "leetcode_master",
    title: "LeetCode Master",
    description: "Complete LeetCode programming challenges",
    icon: <FaCode />,
    progress: 0,
    total: 50,
    unlocked: false,
    color: "blue"
  }
];

const Achievement = ({ achievement }) => {
  if (!achievement) return null;
  
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
  const [showModal, setShowModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [localAchievements, setLocalAchievements] = useState(achievements);

  useEffect(() => {
    const checkLeetCodeAchievement = async () => {
      try {
        const response = await fetch('http://localhost:5000/achievements/leetcode');
        if (!response.ok) {
          throw new Error('Failed to fetch achievement data');
        }
        const leetCodeAchievement = await response.json();
        
        if (!leetCodeAchievement) return;

        setLocalAchievements(prev => {
          const updated = [...prev];
          const index = updated.findIndex(a => a.id === "leetcode_master");
          
          if (index !== -1) {
            const achievement = updated[index];
            if (achievement && leetCodeAchievement.progress !== achievement.progress) {
              // Only show modal if progress has increased
              if (leetCodeAchievement.progress > achievement.progress) {
                setCurrentAchievement({
                  ...leetCodeAchievement,
                  icon: <FaCode />,
                  color: "blue"
                });
                setShowModal(true);
              }
              
              updated[index] = {
                ...achievement,
                progress: leetCodeAchievement.progress,
                unlocked: leetCodeAchievement.unlocked
              };
            }
          }
          
          return updated;
        });
      } catch (error) {
        console.error('Error fetching LeetCode achievement:', error);
      }
    };

    const interval = setInterval(checkLeetCodeAchievement, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentAchievement(null);
  };

  return (
    <div className={styles.achievementsSection}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.icon}>
            <FaTrophy />
          </div>
          <h2>Achievements</h2>
        </div>
      </div>

      <div className={styles.achievementsGrid}>
        {localAchievements.map((achievement) => (
          <Achievement 
            key={achievement.id} 
            achievement={achievement} 
          />
        ))}
      </div>

      {showModal && currentAchievement && (
        <AchievementModal 
          achievement={currentAchievement}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Achievements;

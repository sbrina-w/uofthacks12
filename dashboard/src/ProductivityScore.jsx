import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import styles from './ProductivityScore.module.css';

const ProductivityScore = ({ score, trend }) => {
  return (
    <div className={styles.scoreCard}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <FaChartLine />
        </div>
        <h2>Productivity Score</h2>
      </div>
      
      <div className={styles.scoreDisplay}>
        <div className={styles.score}>{score}</div>
        <div className={`${styles.trend} ${trend.startsWith('+') ? styles.positive : styles.negative}`}>
          {trend}
        </div>
      </div>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ width: `${score}%` }}
          aria-label={`Progress: ${score}%`}
        />
      </div>
      
      <div className={styles.footer}>
        <span>Today's Performance</span>
      </div>
    </div>
  );
};

export default ProductivityScore;
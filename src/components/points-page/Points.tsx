import React from 'react';
import './Points.css';

interface Point {
  points: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'advanced';
}

interface PointsSystemProps {
  pointsData?: Point[];
  loading?: boolean;
  error?: string | null;
}

interface PointsItemProps {
  point: Point;
}

interface PointsHeaderProps {
  title: string;
  subtitle: string;
}

interface PointsFooterProps {
  children: React.ReactNode;
}

// Static points data based on the image
const defaultPointsData: Point[] = [
  {
    points: "1 point",
    description: "for every MAIC workshop/speaker event you attend.",
    difficulty: "easy"
  },
  {
    points: "1 point",
    description: "for every research meeting you attend.",
    difficulty: "easy"
  },
  {
    points: "1 point",
    description: "for every <span style='color: #10B981; font-weight: bold;'>easy 🟢</span> challenge problem you complete.",
    difficulty: "easy"
  },
  {
    points: "2 points",
    description: "for every <span style='color: #F59E0B; font-weight: bold;'>medium 🟡</span> challenge problem you complete.",
    difficulty: "medium"
  },
  {
    points: "3 points",
    description: "for every <span style='color: #EF4444; font-weight: bold;'>hard 🔴</span> challenge problem you complete.",
    difficulty: "hard"
  },
  {
    points: "4 points",
    description: "for every <span style='color: #8B5CF6; font-weight: bold;'>advanced 🟣</span> challenge problem you complete.",
    difficulty: "advanced"
  },
  {
    points: "5 points",
    description: "for every research conference attended.",
    difficulty: "advanced"
  },
  {
    points: "5 points",
    description: "for publishing a research paper.",
    difficulty: "advanced"
  },
  {
    points: "5 points",
    description: "for presenting in the ROSIE Competition.",
    difficulty: "advanced"
  },
  {
    points: "5 points minimum",
    description: "for posting a new learning resource to the website.",
    difficulty: "medium"
  }
];

// Individual point item component
const PointsItem: React.FC<PointsItemProps> = ({ point }) => {
  const getDifficultyClass = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      case 'advanced': return 'difficulty-advanced';
      default: return '';
    }
  };

  return (
    <div className={`points-card ${getDifficultyClass(point.difficulty)}`}>
      <div className="points-item">
        <span className="points-star">⭐</span>
        <span className="points-value">{point.points}</span>
        <span 
          className="points-description"
          dangerouslySetInnerHTML={{ __html: point.description }}
        />
      </div>
    </div>
  );
};

// Header component
const PointsHeader: React.FC<PointsHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="points-header">
      <h1>{title}</h1>
      <div className="points-intro">
        <span 
          dangerouslySetInnerHTML={{ __html: subtitle }}
        />
      </div>
      <div className="gradient-line-points"></div>
    </div>
  );
};

// Footer component
const PointsFooter: React.FC<PointsFooterProps> = ({ children }) => {
  return (
    <div className="points-footer">
      {children}
    </div>
  );
};

// Loading state component
const LoadingState: React.FC = () => {
  return (
    <div className="loading-state">
      <h1>Loading points system...</h1>
    </div>
  );
};

// Error state component
const ErrorState: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="error-state">
      <h1>Error</h1>
      <p>{error}</p>
    </div>
  );
};

// Main Points System component
const PointsSystem: React.FC<PointsSystemProps> = ({ 
  pointsData = defaultPointsData, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="points-page">
      <PointsHeader
        title="How Do The MAIC Points Work?"
        subtitle='<span class="highlight">Earn points by completing MAIC activities and use them to purchase some of our merch!</span><br />To keep track of your points, you can reference the leaderboard on the landing page of this website. These points are gained through a variety of MAIC activities, with some providing you more points than others:'
      />

      <div className="points-grid">
        {pointsData.map((point, index) => (
          <PointsItem key={index} point={point} />
        ))}
      </div>

      <PointsFooter>
        <p>
          You can spend these points in our{' '}
          <a href="/merch">Merch Shop!</a> Just tell{' '}
          <a href="/contact">one of the eboard members</a>{' '}
          what you want to buy and they will deduct the points from your account.
        </p>
        <p>
          You can also use these points to buy a ticket to the end-of-semester raffle, 
          where we will be giving out awards to a few lucky winners!
        </p>
      </PointsFooter>
    </div>
  );
};

export default PointsSystem;
export { PointsItem, PointsHeader, PointsFooter, LoadingState, ErrorState, defaultPointsData };
export type { Point, PointsSystemProps, PointsItemProps, PointsHeaderProps, PointsFooterProps };

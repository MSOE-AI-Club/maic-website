import React, { useEffect, useState } from "react";
import { getFileContent, getRawFileUrl } from "../../../hooks/github-hook";
import "./Leaderboard.css";

interface User {
  User: string;
  "All-Time Points": string;
  "Current Points": string;
  Awards: string;
}

interface Achievement {
  name: string;
  imageUrl: string;
  title: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardCsv, achievementsJson, eboardJson] =
          await Promise.all([
            getFileContent("data/points/user_data.csv"),
            getFileContent("data/achievements/achievementsData.json"),
            getFileContent("data/contact/eboard.json"),
          ]);

        // Handle nulls for all fetched content
        if (
          leaderboardCsv === null ||
          achievementsJson === null ||
          eboardJson === null
        ) {
          setError("Failed to fetch leaderboard data.");
          return;
        }

        let eboardData: { name: string }[] = [];
        try {
          eboardData = JSON.parse(eboardJson);
        } catch (e) {
          setError("Failed to parse eboard data.");
          return;
        }
        const eboardNames = new Set(eboardData.map((member) => member.name));

        const lines = leaderboardCsv.split("\n");
        if (lines.length === 0) {
          setError("Leaderboard data is empty.");
          return;
        }
        const headers = lines[0].split(",");
        const users: User[] = lines
          .slice(1)
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const values = line.split(",");
            const obj = headers.reduce((acc, header, index) => {
              (acc as any)[header.trim()] = (values[index] || "").trim();
              return acc;
            }, {} as User);
            return obj as User;
          });

        users.forEach((user) => {
          if (eboardNames.has(user.User)) {
            user["All-Time Points"] = "EBOARD";
            user["Current Points"] = "EBOARD";
          }
        });

        users.sort((a, b) => {
          const isEboardA = a["All-Time Points"] === "EBOARD";
          const isEboardB = b["All-Time Points"] === "EBOARD";

          if (isEboardA && !isEboardB) return 1;
          if (!isEboardA && isEboardB) return -1;
          if (isEboardA && isEboardB) return a.User.localeCompare(b.User);

          const pointsA = parseInt(a["All-Time Points"], 10);
          const pointsB = parseInt(b["All-Time Points"], 10);

          if (isNaN(pointsA)) return 1;
          if (isNaN(pointsB)) return -1;

          return pointsB - pointsA;
        });

        setLeaderboardData(users);

        let achievementData: Achievement[] = [];
        try {
          achievementData = JSON.parse(achievementsJson);
        } catch (e) {
          setError("Failed to parse achievements data.");
          return;
        }
        setAchievements(achievementData);

        const imagePaths = achievementData.map((a) => a.imageUrl);
        // getRawFileUrl is synchronous, so no need for Promise.all
        const imageUrls = imagePaths.map((path) => getRawFileUrl(path));
        const imageMap = imagePaths.reduce((acc, path, idx) => {
          if (imageUrls[idx]) acc[path] = imageUrls[idx] as string;
          return acc;
        }, {} as { [key: string]: string });
        setImages(imageMap);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch leaderboard data.");
      }
    };

    fetchData();
  }, []);

  const getTrophy = (index: number) => {
    if (index === 0) return "🏆 ";
    if (index === 1) return "🥈 ";
    if (index === 2) return "🥉 ";
    return "";
  };

  const renderAwards = (userAwards: string) => {
    if (!userAwards || !achievements.length) return null;
    const awardsList = userAwards
      .split("|")
      .map((a) => a.trim())
      .filter(Boolean);
    const uniqueAwards = [...new Set(awardsList)];

    return uniqueAwards.map((awardName) => {
      let achievement = achievements.find(
        (a) => a.title === awardName || a.name === awardName
      );

      if (!achievement) {
        const eboardMatch = awardName.match(/^eboard(\d{4})$/);
        if (eboardMatch) {
          achievement = achievements.find((a) => a.name === "Eboard");
        }
      }
      if (achievement && images[achievement.imageUrl]) {
        return (
          <img
            key={awardName}
            src={images[achievement.imageUrl]}
            title={achievement.name}
            className="custom-emoji"
            height="20px"
            width="20px"
            alt={achievement.title}
            loading="lazy"
          />
        );
      }
      return null;
    });
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const matchesSearch = (user: User) =>
    user.User.toLowerCase().includes(searchTerm.toLowerCase());
  const anyMatches = leaderboardData.some(matchesSearch);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-search">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          aria-label="Search leaderboard by name"
        />
      </div>
      <div className="leaderboard-scroll-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Place</th>
              <th>User</th>
              <th>All-Time</th>
              <th>Current</th>
            </tr>
          </thead>
          <tbody>
            {!anyMatches ? (
              <tr>
                <td colSpan={4} className="no-results">
                  No matching users
                </td>
              </tr>
            ) : (
              leaderboardData.map((user, index) => {
                let rowClass = "leaderboard-row";
                if (index === 0) rowClass += " first-place";
                else if (index === 1) rowClass += " second-place";
                else if (index === 2) rowClass += " third-place";

              return (
                <tr key={user.User + index} className={rowClass}>
                  <td className="points-cell">{index + 1}</td>
                  <td>
                    {getTrophy(index)}
                    {user.User} {renderAwards(user.Awards)}
                  </td>
                  <td className="points-cell">{user["All-Time Points"]}</td>
                  <td className="points-cell">{user["Current Points"]}</td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;

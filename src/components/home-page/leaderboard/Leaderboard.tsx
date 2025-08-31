import React, { useEffect, useState } from "react";
import { getFileContent, getRawFileUrl } from "../../../hooks/github-hook";

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
            style={{ marginRight: "4px" }}
          />
        );
      }
      return null;
    });
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const filteredUsers = leaderboardData.filter((user) =>
    user.User.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="leaderboard-container" style={{ marginTop: "2rem", color: "white", width: "100%", overflowX: "hidden" }}>
      <div style={{ marginBottom: "8px" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          aria-label="Search leaderboard by name"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "#1e1e1e",
            color: "#fff",
            outline: "none",
            boxSizing: "border-box",
            maxWidth: "100%",
            WebkitAppearance: "none",
          }}
        />
      </div>
      <div
        style={{
          maxHeight: "550px",
          overflowY: "auto",
          overflowX: "auto",
          marginTop: "10px",
          border: "1px solid white",
          width: "100%",
          boxSizing: "border-box",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table
          className="leaderboard-table"
          style={{ width: "100%", minWidth: 0, borderCollapse: "collapse", tableLayout: "fixed" }}
        >
          <thead>
            <tr
              style={{
                background: "#333",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <th style={{ padding: "8px", wordBreak: "break-word" }}>User</th>
              <th style={{ padding: "8px", width: "30%" }}>All-Time</th>
              <th style={{ padding: "8px", width: "30%" }}>Current</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "12px", textAlign: "center" }}>
                  No matching users
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => {
              const rowStyle: React.CSSProperties = {
                background: index % 2 === 0 ? "#282828" : "#303030",
                fontWeight: "bold",
                fontSize: "1em",
                  wordBreak: "break-word",
              };
              if (index === 0) {
                rowStyle.background = "gold";
                rowStyle.color = "rgb(103, 88, 4)";
              }
              if (index === 1) {
                rowStyle.background = "silver";
                rowStyle.color = "rgb(76, 75, 75)";
              }
              if (index === 2) {
                rowStyle.background = "#cd7f32";
                rowStyle.color = "#5c340c";
              }
              return (
                <tr key={user.User + index} style={rowStyle}>
                  <td style={{ padding: "8px", wordBreak: "break-word" }}>
                    {getTrophy(index)}
                    {user.User} {renderAwards(user.Awards)}
                  </td>
                  <td style={{ padding: "8px", textAlign: "left" }}>{user["All-Time Points"]}</td>
                  <td style={{ padding: "8px", textAlign: "left" }}>{user["Current Points"]}</td>
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

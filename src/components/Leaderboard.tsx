import React, { useState, useEffect } from "react";
import { getFileContent, getRawFileUrl } from "../hooks/github-hook";

interface LeaderboardEntry {
  user: string;
  allTimePoints: number;
  currentPoints: number;
  achievements: Achievement[];
}

interface Achievement {
  iconUrl: string;
  title: string;
}

/**
 * Maps award names to icon filenames (add more as needed)
 */
const AWARD_ICON_MAP: Record<string, { filename: string; title: string }> = {
  Hacksgiving: { filename: "hacksgiving.png", title: "Hacksgiving" },
  "ROSIE Competition Finalist 2024": {
    filename: "ROSIE2024.png",
    title: "2024 ROSIE Challenge Finalist",
  },
  "ROSIE Competition Finalist 2023": {
    filename: "ROSIE2023.png",
    title: "2023 ROSIE Challenge Finalist",
  },
  "ROSIE Competition Finalist 2022": {
    filename: "ROSIE2022.png",
    title: "2022 ROSIE Challenge Finalist",
  },
  "ROSIE Presenter": {
    filename: "ROSIE_Presenter.png",
    title: "ROSIE Presenter",
  },
  "2024 MICS Attendee": {
    filename: "2024MICS.png",
    title: "2024 MICS Attendee",
  },
  "2023 MICS Attendee": {
    filename: "2023MICS.png",
    title: "2023 MICS Attendee",
  },
  "2022 MICS Attendee": {
    filename: "2022MICS.png",
    title: "2022 MICS Attendee",
  },
  "2024 Researcher": {
    filename: "2024Researcher.png",
    title: "2024 AI Researcher",
  },
  "2023 Researcher": {
    filename: "2023Researcher.png",
    title: "2023 AI Researcher",
  },
  "2022 Researcher": {
    filename: "2022Researcher.png",
    title: "2022 AI Researcher",
  },
  "NVIDIA DLI 2023": {
    filename: "NVIDIA_DLI_2023.jpg",
    title: "NVIDIA DLI 2023",
  },
  Overlord: { filename: "Overlord.png", title: "Tech Coord Overlord" },
  Founder: { filename: "Founder.png", title: "Founder" },
  eboard2024: { filename: "current_eboard.png", title: "2024 Eboard" },
  eboard2023: { filename: "old_eboard.png", title: "2023 Eboard" },
  eboard2022: { filename: "old_eboard.png", title: "2022 Eboard" },
  eboard2021: { filename: "old_eboard.png", title: "2021 Eboard" },
  eboard2020: { filename: "old_eboard.png", title: "2020 Eboard" },
  // Add more mappings as needed
};

/**
 * Leaderboard component that displays user rankings and achievements
 * Fetches data from the maic-content repository
 */
const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch CSV from content repo
        const csv = await getFileContent("data/points/user_data.csv");
        if (!csv) throw new Error("Could not load leaderboard data");

        // Parse CSV
        const lines = csv.split(/\r?\n/).filter(Boolean);
        const header = lines[0].split(",");
        const userIdx = header.indexOf("User");
        const awardsIdx = header.indexOf("Awards");
        const allTimeIdx = header.indexOf("All-Time Points");
        const currentIdx = header.indexOf("Current Points");

        const entries: LeaderboardEntry[] = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",");
          if (row.length < Math.max(userIdx, awardsIdx, allTimeIdx, currentIdx))
            continue;
          const user = row[userIdx];
          const allTimePoints = parseInt(row[allTimeIdx], 10) || 0;
          const currentPoints = parseInt(row[currentIdx], 10) || 0;
          const awards =
            row[awardsIdx]
              ?.split("|")
              .map((a) => a.trim())
              .filter(Boolean) || [];

          entries.push({
            user,
            allTimePoints,
            currentPoints,
            achievements: awards
              .map((award) => {
                const mapping = AWARD_ICON_MAP[award];
                return mapping
                  ? { iconUrl: mapping.filename, title: mapping.title }
                  : null;
              })
              .filter(Boolean) as Achievement[],
          });
        }

        // Sort by allTimePoints descending
        entries.sort((a, b) => b.allTimePoints - a.allTimePoints);

        // Convert icon filenames to full URLs
        const processedData = await Promise.all(
          entries.map(async (entry) => ({
            ...entry,
            achievements: await Promise.all(
              entry.achievements.map(async (achievement) => {
                try {
                  const url = await getRawFileUrl(
                    `data/custom_icons/${achievement.iconUrl}`
                  );
                  return {
                    ...achievement,
                    iconUrl: url || achievement.iconUrl,
                  };
                } catch {
                  return achievement;
                }
              })
            ),
          }))
        );

        setLeaderboardData(processedData);
      } catch (err) {
        setError("Failed to load leaderboard data");
        console.error("Error fetching leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
        <div className="text-gray-400">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        <div className="flex space-x-4 text-sm">
          <a
            href="/about-points"
            className="text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
          >
            What Are Points?
          </a>
          <a
            href="/about-achievements"
            className="text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
          >
            Where Are My Achievements?
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 px-2 min-w-[200px]">User</th>
              <th className="text-center py-2 px-2 min-w-[80px]">All-Time</th>
              <th className="text-center py-2 px-2 min-w-[80px]">Current</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <tr
                key={index}
                className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{entry.user}</span>
                    <div className="flex space-x-1">
                      {entry.achievements.map((achievement, achIndex) => (
                        <img
                          key={achIndex}
                          src={achievement.iconUrl}
                          alt={achievement.title}
                          title={achievement.title}
                          className="w-5 h-5 rounded"
                        />
                      ))}
                    </div>
                  </div>
                </td>
                <td className="text-center py-3 px-2 font-bold">
                  {entry.allTimePoints}
                </td>
                <td className="text-center py-3 px-2 font-bold">
                  {entry.currentPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;

import React, { useState, useEffect } from "react";
import { getRawFileUrl } from "../hooks/github-hook";

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

        // Try to fetch leaderboard data from a JSON file or CSV
        // For now, I'll create mock data based on the HTML structure
        // In a real implementation, you'd fetch from data/leaderboard.json or similar

        const mockData: LeaderboardEntry[] = [
          {
            user: "🏆 Mitchell Johnstone",
            allTimePoints: 65,
            currentPoints: 0,
            achievements: [
              {
                iconUrl: "data/custom_icons/ROSIE_Presenter.png",
                title: "ROSIE Presenter",
              },
              {
                iconUrl: "data/custom_icons/2024MICS.png",
                title: "2024 MICS Attendee",
              },
              {
                iconUrl: "data/custom_icons/2023MICS.png",
                title: "2023 MICS Attendee",
              },
              {
                iconUrl: "data/custom_icons/2024Researcher.png",
                title: "2024 Researcher",
              },
              {
                iconUrl: "data/custom_icons/2023Researcher.png",
                title: "2023 Researcher",
              },
              {
                iconUrl: "data/custom_icons/hacksgiving.png",
                title: "Hacksgiving",
              },
            ],
          },
          {
            user: "🥈 Bart Gebka",
            allTimePoints: 62,
            currentPoints: 48,
            achievements: [
              {
                iconUrl: "data/custom_icons/ROSIE2024.png",
                title: "2024 ROSIE Challenge Finalist",
              },
              {
                iconUrl: "data/custom_icons/ROSIE_Presenter.png",
                title: "ROSIE Presenter",
              },
              {
                iconUrl: "data/custom_icons/2024Researcher.png",
                title: "2024 Researcher",
              },
              {
                iconUrl: "data/custom_icons/2023Researcher.png",
                title: "2023 Researcher",
              },
            ],
          },
          {
            user: "🥉 Travis Jankowski",
            allTimePoints: 53,
            currentPoints: 50,
            achievements: [],
          },
          {
            user: "Sydney Balboni",
            allTimePoints: 48,
            currentPoints: 47,
            achievements: [
              {
                iconUrl: "data/custom_icons/old_eboard.png",
                title: "2023 Eboard",
              },
              {
                iconUrl: "data/custom_icons/ROSIE2024.png",
                title: "2024 ROSIE Challenge Finalist",
              },
              {
                iconUrl: "data/custom_icons/ROSIE2023.png",
                title: "2023 ROSIE Challenge Finalist",
              },
              {
                iconUrl: "data/custom_icons/ROSIE_Presenter.png",
                title: "ROSIE Presenter",
              },
              {
                iconUrl: "data/custom_icons/2024MICS.png",
                title: "2024 MICS Attendee",
              },
              {
                iconUrl: "data/custom_icons/2023MICS.png",
                title: "2023 MICS Attendee",
              },
              {
                iconUrl: "data/custom_icons/2024Researcher.png",
                title: "2024 Researcher",
              },
            ],
          },
          {
            user: "Patrick Rafferty",
            allTimePoints: 48,
            currentPoints: 48,
            achievements: [
              {
                iconUrl: "data/custom_icons/hacksgiving.png",
                title: "Hacksgiving",
              },
              {
                iconUrl: "data/custom_icons/NVIDIA_DLI_2023.jpg",
                title: "NVIDIA DLI",
              },
            ],
          },
        ];

        // Convert achievement icon paths to full URLs
        const processedData = await Promise.all(
          mockData.map(async (entry) => ({
            ...entry,
            achievements: await Promise.all(
              entry.achievements.map(async (achievement) => {
                try {
                  const url = await getRawFileUrl(achievement.iconUrl);
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

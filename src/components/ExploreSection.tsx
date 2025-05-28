import React, { useState, useEffect } from "react";
import { getRawFileUrl } from "../hooks/github-hook";

interface ExploreItem {
  title: string;
  subtitle: string;
  description: string;
  additionalInfo: string;
  imageUrl: string;
  borderColor: string;
  textColor: string;
  linkText?: string;
  linkUrl?: string;
}

/**
 * Explore section component that displays the main MAIC activities
 * Shows Speaker Events, Innovation Labs, Research Groups, and Learning Tree
 */
const ExploreSection: React.FC = () => {
  const [exploreItems, setExploreItems] = useState<ExploreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setIsLoading(true);

        const items: ExploreItem[] = [
          {
            title: "Speaker Events",
            subtitle: 'Learning About the "WHY" of AI',
            description:
              "AI-Club hosts weekly Speaker Events where industry experts and leaders share insights into cutting-edge AI technologies and their real-world applications. These events foster a sense of community, provide members with the latest AI industry trends, and highlight the importance of pursuing a technology-driven education.",
            additionalInfo:
              "Join us every week at the Direct Supply ITC from 6:30-7:30 PM for valuable industry insights—and enjoy some free food!",
            imageUrl: "img/misc/joe_poeschl.jpg",
            borderColor: "border-purple-400",
            textColor: "text-purple-400",
          },
          {
            title: "Innovation Labs",
            subtitle: "Getting Hands-on With Industry",
            description:
              'The Innovation Labs offer a hands-on, industry-sponsored platform where teams of 8-12 students tackle real-world AI challenges. These 2-month "hackathon-style" projects emphasize practical applications over novel technology, with $5000 in prizes and direct feedback from industry sponsors.',
            additionalInfo:
              "Teams meet for one hour each week and spend another hour on development. This is a great opportunity to build your AI portfolio, work alongside mentors, and gain industry experience!",
            imageUrl: "img/misc/hacksgiving-2023.jpg",
            borderColor: "border-yellow-400",
            textColor: "text-yellow-400",
            linkText: "check out this overview document.",
            linkUrl:
              "https://drive.google.com/file/d/1kNZouHtwEL0uxEgGWr5qynHw7G9GEfGE/view?usp=sharing",
          },
          {
            title: "Research Groups",
            subtitle: "Publishing Novel AI Applications",
            description:
              "Research Groups are designed for students to work collaboratively on AI projects that often lead to published research. Guided by mentors, these groups dive into advanced AI topics, with a focus on innovative solutions and practical experience across 6 months. We even offer for-credit opportunities!",
            additionalInfo:
              "Teams meet weekly to collaborate and develop research papers, often presented at conferences. Interested in making an impact?",
            imageUrl: "img/misc/2024_ROSIE_MAIC.jpg",
            borderColor: "border-cyan-400",
            textColor: "text-cyan-400",
            linkText: "See our previous projects here.",
            linkUrl: "https://msoe-maic.com/library?nav=Research",
          },
          {
            title: "Learning Tree",
            subtitle: "Your Pathway to Mastering AI",
            description:
              "The Learning Tree is a structured resource guide that helps both beginners and advanced learners navigate AI concepts. Covering fundamental topics through to advanced areas like computer vision and natural language processing, it provides curated resources for self-paced learning -- often used by our hands-on project mentors!",
            additionalInfo:
              "Explore various AI topics and take control of your learning journey by understanding the path ahead.",
            imageUrl: "img/misc/learning_tree_logo.png",
            borderColor: "border-green-400",
            textColor: "text-green-400",
            linkText: "Jump to the Learning Tree!",
            linkUrl: "https://msoe-maic.com/learning-tree",
          },
        ];

        // Fetch image URLs
        const processedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const url = await getRawFileUrl(item.imageUrl);
              return { ...item, imageUrl: url || item.imageUrl };
            } catch {
              return item;
            }
          })
        );

        setExploreItems(processedItems);
      } catch (error) {
        console.error("Error fetching explore data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExploreData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Explore AI-Club</h2>
        <div className="text-gray-400">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Explore AI-Club
      </h1>

      <div className="space-y-6">
        {exploreItems.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl border-3 ${item.borderColor} p-6 space-y-4 md:space-y-0 md:space-x-6`}
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="neural" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23neural)"/></svg>\')',
              backgroundSize: "cover",
            }}
          >
            {/* Image - Left for even indices, Right for odd indices */}
            {index % 2 === 0 ? (
              <>
                <div className="md:w-1/3 flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`w-full aspect-square object-cover rounded-2xl border-2 ${item.borderColor}`}
                  />
                </div>
                <div className="md:w-2/3 text-white">
                  <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                  <p className={`font-bold mb-4 ${item.textColor}`}>
                    {item.subtitle}
                  </p>
                  <p className="mb-4 leading-relaxed">{item.description}</p>
                  <p className="text-gray-300">
                    {item.additionalInfo}
                    {item.linkText && item.linkUrl && (
                      <>
                        {" "}
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
                        >
                          {item.linkText}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="md:w-2/3 text-white order-2 md:order-1">
                  <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                  <p className={`font-bold mb-4 ${item.textColor}`}>
                    {item.subtitle}
                  </p>
                  <p className="mb-4 leading-relaxed">{item.description}</p>
                  <p className="text-gray-300">
                    {item.additionalInfo}
                    {item.linkText && item.linkUrl && (
                      <>
                        {" "}
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
                        >
                          {item.linkText}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div className="md:w-1/3 flex-shrink-0 order-1 md:order-2">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`w-full aspect-square object-cover rounded-2xl border-2 ${item.borderColor}`}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreSection;

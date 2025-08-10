import React, { useEffect, useState } from "react";
import "./ExploreAIClub.css";
import { getFileContent, getRawFileUrl } from "../../../hooks/github-hook";

interface ExploreItem {
  img: string;
  title: string;
  subtitle: string;
  description: string; // HTML string
  borderColor?: string;
}

function mapCardsJsonToExploreItems(jsonText: string | null): ExploreItem[] {
  if (!jsonText) return [];
  try {
    const data = JSON.parse(jsonText) as Array<{
      title: string;
      subtitle: string;
      description: string;
      sub_description?: string;
      imageUrl: string;
      borderColor?: string;
    }>;
    return data.map((item) => ({
      img: getRawFileUrl(item.imageUrl),
      title: item.title,
      subtitle: item.subtitle,
      description: `${item.description}${item.sub_description ? "<br><br>" + item.sub_description : ""}`,
      borderColor: item.borderColor,
    }));
  } catch (_e) {
    return [];
  }
}

function ExploreAIClub() {
  const [items, setItems] = useState<ExploreItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const jsonText = await getFileContent("data/home/cards.json");
      const mapped = mapCardsJsonToExploreItems(jsonText);
      setItems(mapped);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, []);

  return (
    <div className="explore-ai-club-section">
      <div className="explore-intro">
        <h1 className="explore-title">Explore AI Club</h1>
        <div className="line" />
      </div>
      <div className="explore-item-container">
        {items.map((item, index) => (
          <div
            key={index}
            className={`explore-item ${index % 2 === 1 ? "explore-item-reverse" : ""}`}
            style={{
              borderColor: item.borderColor,
              ["--explore-card-accent" as any]: item.borderColor || undefined,
            }}
          >
            <div className="item-image-section">
              <img src={item.img} alt={item.title} className="explore-item-image" />
            </div>
            <div className="item-content-section">
              <h2 className="item-title">{item.title}</h2>
              <h3 className="item-subtitle">{item.subtitle}</h3>
              <p className="item-description" dangerouslySetInnerHTML={{ __html: item.description }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreAIClub;

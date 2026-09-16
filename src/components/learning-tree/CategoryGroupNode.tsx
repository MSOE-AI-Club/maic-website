import { useState, useEffect } from "react";
import { type Node, type NodeProps, Handle, Position } from "@xyflow/react";
import { getRawFileUrl } from "../../hooks/github-hook";
import { getColorScheme } from "./colorUtils";

export type CategoryNodeEntry = { id: string; name: string; link: string };

export type CategoryGroupNodeData = {
  categoryName: string;
  categoryColor: string;
  categoryImage: string;
  categoryNodes: CategoryNodeEntry[];
  onExpand: (name: string) => void;
  onHoverStart?: (id: string, rightShift: number, leftShift: number) => void;
  onHoverEnd?: () => void;
};

type CategoryGroupNodeType = Node<CategoryGroupNodeData, "categoryGroup">;

const CategoryGroupNode = ({ id, data }: NodeProps<CategoryGroupNodeType>) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hovered, setHovered] = useState(false);
  const { baseColor, gradientTop, gradientBottom, textColor } =
    getColorScheme(data.categoryColor);

  useEffect(() => {
    if (!data.categoryImage) return;
    if (
      data.categoryImage.startsWith("http://") ||
      data.categoryImage.startsWith("https://")
    ) {
      setImageUrl(data.categoryImage);
      return;
    }
    const url = getRawFileUrl(data.categoryImage);
    if (url) setImageUrl(url);
  }, [data.categoryImage]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseEnter={() => { setHovered(true); data.onHoverStart?.(id, 240, 0); }}
      onMouseLeave={() => { setHovered(false); data.onHoverEnd?.(); }}
    >
      {/* ── Main image card (always visible) ── */}
      <div
        onClick={() => data.onExpand(data.categoryName)}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: hovered ? "12px 0 0 12px" : 12,
          border: `3px solid ${baseColor}`,
          background: `linear-gradient(to bottom, ${gradientTop}, ${gradientBottom})`,
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: hovered
            ? `0 0 28px ${baseColor}99`
            : `0 0 16px ${baseColor}55`,
          transition: "box-shadow 0.2s ease, border-radius 0.15s ease",
          zIndex: 1,
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: baseColor, visibility: "hidden" }}
          isConnectable={false}
        />

        {/* Image — fills most of the card */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={data.categoryName}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                opacity: 0.3,
                color: textColor,
              }}
            >
              ●
            </div>
          )}
        </div>

        {/* Title strip — below image, inside box */}
        <div
          style={{
            padding: "8px 10px",
            background: "rgba(0,0,0,0.55)",
            borderTop: `1px solid ${baseColor}55`,
            color: textColor,
            fontWeight: 700,
            fontSize: 13,
            textAlign: "center",
            lineHeight: 1.25,
            letterSpacing: "0.02em",
            flexShrink: 0,
          }}
        >
          {data.categoryName}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: baseColor, visibility: "hidden" }}
          isConnectable={false}
        />
      </div>

      {/* ── Hover: right-side panel with node list ── */}
      {hovered && data.categoryNodes.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            // overlap the right border of the main box by 3 px so there's no gap/seam
            left: "calc(100% - 3px)",
            width: 230,
            height: "100%",
            background: `linear-gradient(to top, ${gradientBottom}, ${gradientTop})`,
            border: `3px solid ${baseColor}`,
            borderLeft: "none",
            borderRadius: "0 12px 12px 0",
            padding: "10px 12px",
            overflowY: "auto",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
          onMouseEnter={() => { setHovered(true); data.onHoverStart?.(id, 240, 0); }}
          onMouseLeave={() => { setHovered(false); data.onHoverEnd?.(); }}
        >
          <div
            style={{
              fontSize: 10,
              color: textColor,
              fontWeight: 700,
              marginBottom: 7,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            {data.categoryNodes.length} topic{data.categoryNodes.length !== 1 ? "s" : ""}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {data.categoryNodes.map((node) => (
              <a
                key={node.id}
                href={node.link || "#"}
                style={{
                  display: "block",
                  padding: "4px 0",
                  color: textColor,
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: "none",
                  borderBottom: `1px solid ${baseColor}33`,
                  lineHeight: 1.35,
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
                }}
              >
                {node.name}
              </a>
            ))}
          </div>

          {/* "Click to expand" hint at bottom */}
          <div
            onClick={() => data.onExpand(data.categoryName)}
            style={{
              marginTop: 8,
              fontSize: 10,
              textAlign: "center",
              color: textColor,
              opacity: 0.6,
              cursor: "pointer",
              fontStyle: "italic",
            }}
          >
            Click card to expand all →
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryGroupNode;

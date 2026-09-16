import { type Node, type NodeProps, Handle, Position } from "@xyflow/react";
import { getColorScheme, getTranslucentColor } from "./colorUtils";

export type CategoryContainerNodeData = {
  categoryName: string;
  categoryColor: string;
  onCollapse: (name: string) => void;
};

type CategoryContainerNodeType = Node<
  CategoryContainerNodeData,
  "categoryContainer"
>;

const CategoryContainerNode = ({
  data,
}: NodeProps<CategoryContainerNodeType>) => {
  const colorScheme = getColorScheme(data.categoryColor);
  const { baseColor } = colorScheme;
  const bgColor = getTranslucentColor(data.categoryColor);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: baseColor, visibility: "hidden" }}
        isConnectable={false}
      />

      {/* Category label above the box */}
      <div
        style={{
          position: "absolute",
          top: -36,
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          userSelect: "none",
          zIndex: 10,
        }}
      >
        <span
          onClick={() => data.onCollapse(data.categoryName)}
          style={{
            color: baseColor,
            fontWeight: 700,
            fontSize: 15,
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${baseColor}`,
            letterSpacing: "0.02em",
            cursor: "pointer",
          }}
        >
          {data.categoryName}
        </span>
        <span
          onClick={() => data.onCollapse(data.categoryName)}
          style={{
            color: "#9ca3af",
            fontSize: 12,
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "2px 8px",
            borderRadius: 4,
            border: `1px solid ${baseColor}55`,
            cursor: "pointer",
          }}
        >
          collapse ✕
        </span>
      </div>

      {/* Full container background — click anywhere here to collapse */}
      <div
        onClick={() => data.onCollapse(data.categoryName)}
        title="Click to collapse"
        style={{
          width: "100%",
          height: "100%",
          border: `2px dashed ${baseColor}`,
          borderRadius: 12,
          background: bgColor,
          boxSizing: "border-box",
          cursor: "pointer",
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: baseColor, visibility: "hidden" }}
        isConnectable={false}
      />
    </div>
  );
};

export default CategoryContainerNode;

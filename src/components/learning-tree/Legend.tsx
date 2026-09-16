import { useState, useEffect } from "react";
import { Divider } from "@mui/material";
import type { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import "./assets/css/legend.css";
import { useNavigate } from "react-router-dom";
import { getFileContent } from "../../hooks/github-hook";
import { getBaseColor } from "./colorUtils";
import SpotlightCard from "../react-bits/spotlight-card/SpotlightCard";

interface LegendProps {
  expandedCategories: Set<string>;
  onExpandCategory: (name: string) => void;
  onCollapseCategory: (name: string) => void;
  forceRefresh?: (section: string) => void;
  viewMode?: "compact" | "full";
  onSetViewMode?: (mode: "compact" | "full") => void;
}

// Extended TreeViewBaseItem with category color and node metadata
interface ExtendedTreeViewItem extends TreeViewBaseItem {
  categoryColor?: string;
  linkToTree?: string;
  isCategory?: boolean;
}

// Fetch and parse tree.json categories
const getAllNodes = async () => {
  try {
    const response = await getFileContent("data/learning-tree/tree.json");
    if (!response) throw new Error("Failed to fetch tree.json");
    const treeJsonContent = JSON.parse(response);
    return treeJsonContent.categories || {};
  } catch (error) {
    console.error("Error fetching tree nodes:", error);
    return {};
  }
};

// Build MUI X RichTreeView items from tree.json categories
const buildTreeViewItems = async (): Promise<ExtendedTreeViewItem[]> => {
  const treeView: ExtendedTreeViewItem[] = [];
  const categories = await getAllNodes();

  for (const category of Object.keys(categories)) {
    const categoryData = categories[category];
    const categoryNodes = categoryData.nodes ?? [];

    const children: ExtendedTreeViewItem[] = categoryNodes.map(
      (node: { id: string; name: string }) => ({
        id: node.id,
        label: node.name,
        linkToTree: `/learning-tree?node=${node.id}`,
        categoryColor: categoryData.category_color,
        isCategory: false,
      })
    );

    treeView.push({
      id: category,
      label: category,
      children: children.sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
      ),
      categoryColor: categoryData.category_color,
      isCategory: true,
    });
  }

  return treeView;
};

const Legend = ({
  expandedCategories,
  onExpandCategory,
  onCollapseCategory,
  viewMode = "compact",
  onSetViewMode,
}: LegendProps) => {
  const [directory, setDirectory] = useState<ExtendedTreeViewItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    buildTreeViewItems().then(setDirectory);
  }, []);

  // Apply category-color indicators to tree items after render.
  // Re-runs whenever expandedCategories changes so newly mounted child
  // items (which appear when a category is expanded) also get colored.
  useEffect(() => {
    if (directory.length === 0) return;

    const applyColors = () => {
      const treeItems = document.querySelectorAll(
        ".navigation .MuiTreeItem-content"
      );
      treeItems.forEach((item) => {
        const itemId =
          item.getAttribute("data-testid") || item.textContent?.trim();
        if (itemId) {
          const color = findCategoryColor(directory, itemId);
          if (color) {
            const colorValue = getBaseColor(color);
            (item as HTMLElement).style.setProperty(
              "--category-color",
              colorValue
            );
          }
        }
      });
    };

    setTimeout(applyColors, 120);
  // expandedCategories is a new Set reference on every change, so this
  // correctly fires whenever the sidebar tree re-renders new items.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directory, expandedCategories]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const findItemLink = (
    items: ExtendedTreeViewItem[],
    targetId: string
  ): string | null => {
    for (const item of items) {
      if (item.id === targetId && item.linkToTree) return item.linkToTree;
      if (item.children) {
        const found = findItemLink(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  /** Returns the category name for a given node id (looks in children arrays). */
  const findCategoryForNode = (nodeId: string): string | null => {
    for (const cat of directory) {
      if (cat.children?.some((child) => child.id === nodeId)) return cat.id;
    }
    return null;
  };

  const findCategoryColor = (
    items: ExtendedTreeViewItem[],
    targetId: string
  ): string | null => {
    for (const item of items) {
      if (item.id === targetId && item.categoryColor) return item.categoryColor;
      if (item.children) {
        const found = findCategoryColor(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const isCategory = (itemId: string): boolean =>
    directory.some((cat) => cat.id === itemId);

  // ── Click handler ─────────────────────────────────────────────────────────

  const handleItemClick = (_event: React.SyntheticEvent, itemId: string) => {
    if (isCategory(itemId)) {
      // Always expand + scroll to heading from sidebar
      // (collapse is handled by the expand arrow or the tree's collapse button)
      onExpandCategory(itemId);
    } else {
      // Node item: expand its parent category then navigate
      const link = findItemLink(directory, itemId);
      if (link) {
        const categoryName = findCategoryForNode(itemId);
        if (categoryName && !expandedCategories.has(categoryName)) {
          onExpandCategory(categoryName);
        }
        navigate(link);
      }
    }
  };

  // Syncs arrow-click expand/collapse with the shared expandedCategories state
  const handleExpandedItemsChange = (
    _event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    const newExpanded = new Set(itemIds.filter((id) => isCategory(id)));

    // Categories added via arrow click
    newExpanded.forEach((id) => {
      if (!expandedCategories.has(id)) onExpandCategory(id);
    });

    // Categories removed via arrow click
    expandedCategories.forEach((id) => {
      if (!newExpanded.has(id)) onCollapseCategory(id);
    });
  };

  return (
    <div className="legend" style={{ zIndex: 0 }}>
      <SpotlightCard
        className="legend-header-card"
        style={{
          padding: "5px",
          minHeight: "unset",
          minWidth: "unset",
          margin: "20px 16px 16px 16px",
          background: "#0b0f1a",
        }}
      >
        <h2 className="header">
          <a href="/learning-tree">Learning Tree</a>
        </h2>
      </SpotlightCard>

      {/* ── Compact / Full Tree toggle ── */}
      {onSetViewMode && (
        <div
          style={{
            display: "flex",
            margin: "0 16px 12px 16px",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          {(["compact", "full"] as Array<"compact" | "full">).map((mode) => (
            <button
              key={mode}
              onClick={() => onSetViewMode(mode)}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "Roboto, sans-serif",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "background 0.18s, color 0.18s",
                background:
                  viewMode === mode ? "rgba(99,102,241,0.85)" : "transparent",
                color: viewMode === mode ? "#fff" : "#6b7280",
              }}
            >
              {mode === "compact" ? "Compact" : "Full Tree"}
            </button>
          ))}
        </div>
      )}

      <Divider
        sx={{ borderColor: "white", margin: "0rem 1rem" }}
        aria-hidden="true"
      />

      <div className="navigation">
        <RichTreeView
          items={directory}
          expandedItems={Array.from(expandedCategories)}
          onExpandedItemsChange={handleExpandedItemsChange}
          onItemClick={handleItemClick}
          sx={{
            color: "#e5e7eb",
            height: "100%",
            width: "100%",
            "& .MuiTreeItem-content": {
              color: "#e5e7eb",
              borderRadius: "8px",
              margin: "4px 0",
              paddingRight: "8px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: "translateX(4px)",
              },
              "&.Mui-focused, &.Mui-selected": {
                backgroundColor: "rgba(99, 102, 241, 0.2)",
                border: "1px solid rgba(99, 102, 241, 0.5)",
              },
            },
            "& .MuiTreeItem-label": {
              color: "#e5e7eb",
              fontFamily: "Roboto, sans-serif",
              fontWeight: 500,
              fontSize: "0.875rem",
              textAlign: "left",
              justifyContent: "flex-start",
              overflow: "hidden",
            },
            "& .MuiTreeItem-iconContainer": {
              color: "#a78bfa",
              "& svg": { color: "#a78bfa" },
            },
            "& .MuiTreeItem-group": {
              marginLeft: "16px",
              paddingRight: "8px",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Legend;

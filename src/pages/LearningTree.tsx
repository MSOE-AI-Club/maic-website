import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Tree from "../components/learning-tree/Tree";
import NavBar from "../components/navbar/Navbar";
import Legend from "../components/learning-tree/Legend";

type ViewMode = "compact" | "full";

const LearningTree = () => {
  const [searchParams] = useSearchParams();
  const treeContainerRef = useRef<HTMLDivElement | null>(null);

  // Shared expand/collapse state for both Legend and Tree
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // When set, Tree will fitView to this category after the next graph rebuild
  const [focusCategoryName, setFocusCategoryName] = useState<string | null>(null);

  const handleExpandCategory = useCallback((name: string) => {
    setExpandedCategories((prev) => new Set([...prev, name]));
    setFocusCategoryName(name);
  }, []);

  const handleCollapseCategory = useCallback((name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }, []);

  const handleClearFocus = useCallback(() => {
    setFocusCategoryName(null);
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>("compact");

  useEffect(() => {
    document.title = "MAIC - Learning Tree";
  }, []);

  // Remove ReactFlow attribution branding
  useEffect(() => {
    const container = treeContainerRef.current;
    if (!container) return;

    const removeAttribution = () => {
      container
        .querySelectorAll(".react-flow__attribution")
        .forEach((el) => el.remove());
    };

    removeAttribution();

    const observer = new MutationObserver(removeAttribution);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="App"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <NavBar page="LearningTree" />
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        <Legend
          expandedCategories={expandedCategories}
          onExpandCategory={handleExpandCategory}
          onCollapseCategory={handleCollapseCategory}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
        />
        <div
          style={{
            flex: 1,
            marginLeft: "max(200px, 12.5%)",
            position: "relative",
            paddingTop: "56px",
            boxSizing: "border-box",
          }}
          ref={treeContainerRef}
        >
          <Tree
            nodeID={searchParams.get("node")}
            expandedCategories={expandedCategories}
            onExpandCategory={handleExpandCategory}
            onCollapseCategory={handleCollapseCategory}
            focusCategoryName={focusCategoryName}
            onClearFocus={handleClearFocus}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default LearningTree;

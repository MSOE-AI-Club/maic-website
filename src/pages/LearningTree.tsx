import Tree from "../components/learning-tree/Tree";
import NavBar from "../components/Navbar";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import Legend from "../components/learning-tree/Legend";

const LearningTree = () => {
  const [searchParams] = useSearchParams();
  const treeContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "MAIC - Learning Tree";
  }, []);

  useEffect(() => {
    const container = treeContainerRef.current;
    if (!container) return;

    const removeAttribution = () => {
      const elements = container.querySelectorAll(".react-flow__attribution");
      elements.forEach((el) => el.remove());
    };

    // Attempt immediately in case it's already rendered
    removeAttribution();

    // Observe for any subsequent renders/updates that add it back
    const observer = new MutationObserver(() => {
      removeAttribution();
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar page = 'LearningTree'/>
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Legend/>
        <div style={{ 
          flex: 1, 
          marginLeft: 'max(200px, 12.5%)',
          position: 'relative'
        }} ref={treeContainerRef}>
          <Tree nodeID = {searchParams.get("node")}/>
        </div>
      </div>
    </div>
  );
};

export default LearningTree;

import Tree from "../components/learning-tree/Tree";
import Navbar from "../components/Navbar";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const LearningTree = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "MAIC - Learning Tree";
  }, []);

  return (
    <div className="App">
      <Navbar page="Learning Tree" />
      <Tree nodeID={searchParams.get("node")} />
    </div>
  );
};

export default LearningTree;

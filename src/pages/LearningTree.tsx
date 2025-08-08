import Tree from "../components/learning-tree/Tree";
import NavBar from "../components/Navbar";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import Legend from "../components/learning-tree/Legend";

const LearningTree = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "MAIC - Learning Tree";
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
        }}>
          <Tree nodeID = {searchParams.get("node")}/>
        </div>
      </div>
    </div>
  );
};

export default LearningTree;

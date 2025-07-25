import Tree from "../components/learning-tree/Tree"
import NavBar from "../components/Navbar";
import {useSearchParams } from "react-router-dom";
import React from "react";


const LearningTree = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    document.title = 'MAIC - Learning Tree';
  }, []);

  return (
    <div className="App">
      <NavBar page = 'LearningTree'/>
      <Tree nodeID = {searchParams.get("node")}/>
    </div>
  );
};

export default LearningTree;
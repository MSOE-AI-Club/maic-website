import { useState, useEffect } from "react";
import { Button, Divider, Tooltip } from "@mui/material";
import type { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import "./assets/css/legend.css";
import DescriptionIcon from "@mui/icons-material/Description";
import { Link, useNavigate } from "react-router-dom";
import { getFileContent } from "../../hooks/github-hook";

/**
 * The LeftPanelProps interface represents the props that the LeftPanel component receives.
 */
interface LeftPanelProps {
  forceRefresh?: (section: string) => void;
}

interface nodeData {
  title: string;
  section: string;
  linkToTree: string;
}

interface section {
  title: string;
  nodes: nodeData[];
  linkToTree: string;
}



// Get node data from backend
const get_all_nodes = async () => {
  try {
    // Fetch the tree.json file using the GitHub hook
    const response = await getFileContent(
      "data/learning-tree/tree.json"
    );

    if (!response) {
      throw new Error("Failed to fetch tree.json");
    }

    const treeJsonContent = JSON.parse(response);
    return treeJsonContent.categories || [];
  } catch (error) {
    console.error("Error fetching sections:", error);
    // Fallback to mock data if API fails
    return {
      "AI Basics": [
        {
          title: "Introduction to AI",
          section: "AI Basics",
          linkToTree: "/learning-tree?node=1"
        }
      ]
    }
  }
}

// Create MUI X Tree View Object to display tree of dropdowns
const create_MUI_X_TreeView = async () => {
  const treeView: TreeViewBaseItem[] = [];
  const categories = await get_all_nodes();

  for (const category of Object.keys(categories)) {
    const categoryNodes = categories[category].nodes;
    let children = [];
    for (const node of categoryNodes) {
      children.push({
        id: node.id,
        label: node.name,
        linkToTree: `/learning-tree?node=${node.id}`
      });
    }
    treeView.push({
      id: category,
      label: category,
      children: children.sort((a, b) => a.id.localeCompare(b.id))
    });
  }

  console.log("Tree View:", treeView);

  return treeView;
}

/* 
Reads all files within the 'learning-tree-nodes' directory and creates node objects for each 
to eventually generate the Directory. 
*/
const getSections = async (): Promise<nodeData[]> => {
  try {
    const categories = (await get_all_nodes());
    return Object.keys(categories).map((category) => ({
      title: category,
      section: category,
      linkToTree: `/learning-tree?node=${category}`
    }));
  } catch (error) {
    console.error("Error fetching sections:", error);
    // Fallback to mock data if API fails
    return [
      {
        title: "Introduction to AI",
        section: "AI Basics",
        linkToTree: "/learning-tree?node=1"
      },
      {
        title: "Machine Learning Fundamentals",
        section: "ML Basics", 
        linkToTree: "/learning-tree?node=2"
      },
      {
        title: "Deep Learning",
        section: "DL Basics",
        linkToTree: "/learning-tree?node=3"
      }
    ];
  }
};

/**
 * The Legend component displays the learning tree legend/navigation.
 * @param {LeftPanelProps} props - The props to be passed to the Legend component.
 * @returns {JSX.Element} The Legend component.
 */
const Legend = (props: LeftPanelProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<nodeData[]>([]);
  const [directory, setDirectory] = useState<TreeViewBaseItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Legend component mounted");

    const fetchDirectory = async () => {
      setDirectory(await create_MUI_X_TreeView());
    };
    fetchDirectory();
    
    // Get sections for learning tree
    const fetchSections = async () => {
      console.log("Fetching sections...");
      const treeSections = await getSections();
      console.log("Sections fetched:", treeSections);
      setSections(treeSections);
    };
    fetchSections();
  }, []);

  console.log("Legend rendering with sections:", sections.length, "categories:", categories.length);

  const findItemLink = (items: TreeViewBaseItem[], targetItemId: string): string | null => {
    for (const treeItem of items) {
      if (treeItem.id === targetItemId && 'linkToTree' in treeItem) {
        return (treeItem as any).linkToTree;
      }
      if (treeItem.children) {
        const found = findItemLink(treeItem.children, targetItemId);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * The Legend component.
   */
  return (
    <div className="left-panel" style={{ zIndex: 0 }}>
      <h2 className="header">
        <a href="/learning-tree">Learning Tree</a>
      </h2>
      
      {/* Learning Tree Sections */}
      <Divider
        sx={{ borderColor: "white", margin: "0rem 1rem" }}
        aria-hidden="true"
      />
      <div className="navigation" style={{ 
        height: 'calc(100vh - 125px)', 
        overflowY: 'auto',
        marginRight: '16px'
      }}>
        <RichTreeView
          items={directory}
          defaultExpandedItems={[]}
          onItemClick={(event, itemId) => {
            const link = findItemLink(directory, itemId);
            console.log("Link:", link);
            if (link) navigate(link);
          }}
          sx={{
            color: 'white',
            height: '100%',
            '& .MuiTreeItem-content': {
              color: 'white',
              borderRadius: '8px',
              margin: '2px 0',
              paddingRight: '16px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateX(4px)',
              },
              '&.Mui-focused, &.Mui-selected': {
                backgroundColor: 'rgba(5, 120, 255, 0.2)',
                border: '1px solid rgba(5, 120, 255, 0.5)',
              },
            },
            '& .MuiTreeItem-label': {
              color: 'white',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              fontSize: '0.75rem',
              textAlign: 'left',
              justifyContent: 'flex-start',
            },
            '& .MuiTreeItem-iconContainer': {
              color: 'white',
              '& svg': {
                color: 'white',
              },
            },
            '& .MuiTreeItem-group': {
              marginLeft: '16px',
              paddingRight: '16px',
            },
          }}
        />
      </div>
    </div>
  );
};

export default Legend;

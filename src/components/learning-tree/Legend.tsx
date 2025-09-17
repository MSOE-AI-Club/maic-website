import { useState, useEffect } from "react";
import { Divider } from "@mui/material";
import type { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import "./assets/css/legend.css";
import { useNavigate } from "react-router-dom";
import { getFileContent } from "../../hooks/github-hook";
import { getBaseColor } from "./colorUtils";
import SpotlightCard from "../react-bits/spotlight-card/SpotlightCard";

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

// Extended TreeViewBaseItem with category color
interface ExtendedTreeViewItem extends TreeViewBaseItem {
  categoryColor?: string;
  linkToTree?: string;
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
  const treeView: ExtendedTreeViewItem[] = [];
  const categories = await get_all_nodes();

  for (const category of Object.keys(categories)) {
    const categoryData = categories[category];
    const categoryNodes = categoryData.nodes;
    let children: ExtendedTreeViewItem[] = [];
    for (const node of categoryNodes) {
      children.push({
        id: node.id,
        label: node.name,
        linkToTree: `/learning-tree?node=${node.id}`,
        categoryColor: categoryData.category_color
      });
    }
    treeView.push({
      id: category,
      label: category,
      children: children.sort((a, b) => parseInt(a.id) - parseInt(b.id)),
      categoryColor: categoryData.category_color
    });
  }

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
  const [directory, setDirectory] = useState<ExtendedTreeViewItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchDirectory = async () => {
      setDirectory(await create_MUI_X_TreeView());
    };
    fetchDirectory();
    
    // Get sections for learning tree
    const fetchSections = async () => {
      const treeSections = await getSections();
      setSections(treeSections);
    };
    fetchSections();
  }, []);

  // Apply category colors to tree items after rendering
  useEffect(() => {
    if (directory.length > 0) {
      const applyCategoryColors = () => {
        const treeItems = document.querySelectorAll('.navigation .MuiTreeItem-content');
        treeItems.forEach((item) => {
          const itemId = item.getAttribute('data-testid') || item.textContent?.trim();
          if (itemId) {
            const categoryColor = getCategoryColor(directory, itemId);
            if (categoryColor) {
              const colorValue = getColorValue(categoryColor);
              const pseudoElement = item as HTMLElement;
              pseudoElement.style.setProperty('--category-color', colorValue);
            }
          }
        });
      };

      // Apply colors after a short delay to ensure DOM is ready
      setTimeout(applyCategoryColors, 100);
    }
  }, [directory]);

  const findItemLink = (items: ExtendedTreeViewItem[], targetItemId: string): string | null => {
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

  const getCategoryColor = (items: ExtendedTreeViewItem[], targetItemId: string): string | null => {
    for (const treeItem of items) {
      if (treeItem.id === targetItemId && treeItem.categoryColor) {
        return treeItem.categoryColor;
      }
      if (treeItem.children) {
        const found = getCategoryColor(treeItem.children, targetItemId);
        if (found) return found;
      }
    }
    return null;
  };

  // Use shared color utility function
  const getColorValue = (colorName: string): string => {
    return getBaseColor(colorName);
  };

  /**
   * The Legend component.
   */
  return (
    <div className="legend" style={{ zIndex: 0 }}>
      <SpotlightCard 
        className="legend-header-card"
        style={{
          padding: "5px",
          minHeight: "unset",
          minWidth: "unset",
          margin: "20px 16px 16px 16px",
          background: "#0b0f1a"
        }}
      >
        <h2 className="header">
          <a href="/learning-tree">Learning Tree</a>
        </h2>
      </SpotlightCard>
      
      {/* Learning Tree Sections */}
      <Divider
        sx={{ borderColor: "white", margin: "0rem 1rem" }}
        aria-hidden="true"
      />
      <div className="navigation">
        <RichTreeView
          items={directory}
          defaultExpandedItems={[]}
          onItemClick={(event, itemId) => {
            const link = findItemLink(directory, itemId);
            if (link) navigate(link);
          }}
          sx={{
            color: '#e5e7eb',
            height: '100%',
            width: '100%',
            '& .MuiTreeItem-content': {
              color: '#e5e7eb',
              borderRadius: '8px',
              margin: '4px 0',
              paddingRight: '8px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateX(4px)',
              },
              '&.Mui-focused, &.Mui-selected': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.5)',
              },
            },
            '& .MuiTreeItem-label': {
              color: '#e5e7eb',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              fontSize: '0.875rem',
              textAlign: 'left',
              justifyContent: 'flex-start',
              overflow: 'hidden',
            },
            '& .MuiTreeItem-iconContainer': {
              color: '#a78bfa',
              '& svg': {
                color: '#a78bfa',
              },
            },
            '& .MuiTreeItem-group': {
              marginLeft: '16px',
              paddingRight: '8px',
            },
          }}
        />
      </div>
    </div>
  );
};

export default Legend;

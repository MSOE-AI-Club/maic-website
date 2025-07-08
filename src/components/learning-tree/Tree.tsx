import { useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type FitViewOptions,
  type NodeTypes,
  PanOnScrollMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import LearningTreeNode from "./LearningTreeNode.tsx";
import "./assets/css/tree.css";
import { getFileContent } from "../../hooks/github-hook";

interface TreeProps {
  nodeID: string | null;
}

// Interface for the tree.json structure
interface TreeJsonData {
  categories: Record<
    string,
    {
      category_color: string;
      nodes: ActualTreeJsonNode[];
    }
  >;
  metadata: {
    total_nodes: number;
    total_categories: number;
    generated_at: string;
  };
}

interface ActualTreeJsonNode {
  id: string;
  filename: string;
  name: string;
  description: string;
  category: string;
  api_image_path: string;
  link: string;
  highlighted_path: string;
  position: { x: number; y: number };
  parents: string[];
  children: string[];
}

// Custom node data type with index signature
interface CustomNodeData {
  name: string;
  image_path: string;
  api_image_path: string;
  description: string;
  category: string;
  category_color: string;
  highlighted_path: string;
  link: string;
  [key: string]: unknown; // Index signature to satisfy the constraint
}

// Custom node type extending ReactFlow's Node with a children attribute
interface CustomNode extends Node<CustomNodeData> {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: CustomNodeData;
  children?: string[];
}

/**
 * Link to ReactFlow fitViewOptions documentation: https://reactflow.dev/api-reference/types/fit-view-options
 * This object sets the default node(s) to fit the view to when the Learning Tree is first loaded, as well as setting
 * the default zoom too.
 */
const fitViewOptions: FitViewOptions = {
  minZoom: 0.000001,
  maxZoom: 0.8,
  nodes: [{ id: "1" }, { id: "72" }], // Node(s) to fit in the screen on page load {id: 'rosie0'}
};

/**
 * Link to ReactFlow custom node documentation w/ typescript: https://reactflow.dev/learn/advanced-use/typescript
 * Link to ReactFlow custom node documentation (General): https://reactflow.dev/learn/customization/custom-nodes
 * This defines the custom node type we created, allowing it to be used in the flow.
 */
const nodeTypes: NodeTypes = {
  treeNode: LearningTreeNode,
};

/**
 * Sets up fallback nodes for demonstration purposes when tree.json is not available
 */
const fallbackNodes: CustomNode[] = [
  {
    id: "fallback",
    type: "treeNode",
    position: { x: 0, y: 0 },
    data: {
      name: "Learning Tree Loading...",
      image_path: "https://via.placeholder.com/150",
      api_image_path: "https://via.placeholder.com/150",
      description: "Loading the learning tree data. Please wait...",
      category: "System",
      category_color: "gray",
      highlighted_path: "",
      link: "/learning-tree",
    },
    children: [],
  },
];

/**
 * Transforms tree.json nodes to the format expected by ReactFlow and recalculates positions
 * using the original algorithm to match the old implementation
 */
const transformTreeNodes = (treeData: TreeJsonData): CustomNode[] => {
  const allNodes: CustomNode[] = [];
  const nodeMap = new Map<string, CustomNode>();

  // First pass: Create all nodes with their basic data but no positions yet
  Object.entries(treeData.categories).forEach(([, categoryData]) => {
    categoryData.nodes.forEach((node) => {
      const transformedNode: CustomNode = {
        id: node.id,
        type: "treeNode",
        position: { x: 0, y: 0 }, // Will be calculated later
        data: {
          name: node.name,
          image_path: node.api_image_path,
          api_image_path: node.api_image_path,
          description: node.description,
          category: node.category,
          category_color: categoryData.category_color,
          highlighted_path: node.highlighted_path,
          link: node.link,
        },
        children: node.children,
      };
      allNodes.push(transformedNode);
      nodeMap.set(node.id, transformedNode);
    });
  });

  // Second pass: Calculate positions using the original algorithm
  // Sort nodes by ID to process them in order
  allNodes.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  allNodes.forEach((node) => {
    const originalNode = Object.values(treeData.categories)
      .flatMap((cat) => cat.nodes)
      .find((n) => n.id === node.id);

    if (!originalNode) return;

    if (node.id === "1") {
      // Root node
      node.position = { x: 0, y: 0 };
    } else {
      // Calculate position based on parents
      const parents = originalNode.parents;
      if (parents.length > 0) {
        // Calculate average horizontal position from parents' horizontal_displacement values
        let totalHorizontalDisplacement = 0;
        parents.forEach((parentId) => {
          // Note: We don't have horizontal_displacement in tree.json, so we'll use the existing x position
          const parentNode = nodeMap.get(parentId);
          if (parentNode) {
            totalHorizontalDisplacement += parentNode.position.x;
          }
        });
        const averageX = totalHorizontalDisplacement / parents.length;

        // Use existing horizontal position from tree.json as displacement
        const horizontalDisplacement = originalNode.position.x;
        const x =
          horizontalDisplacement !== 0 ? horizontalDisplacement : averageX;

        // Calculate Y position: parent's Y + vertical displacement (default 500)
        const firstParent = nodeMap.get(parents[0]);
        let y = firstParent ? firstParent.position.y : 0;

        // Use a default of 500 for vertical displacement if not specified
        // Since we don't have the original displacement values, we'll infer them
        y += 500; // Default vertical displacement

        node.position = { x, y };
      }
    }
  });

  return allNodes;
};

/**
 * Generates edges based on the children attribute of each node.
 */
const generateEdges = (nodes: CustomNode[]): Edge[] => {
  const edges: Edge[] = [];
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      node.children.forEach((childId, index) => {
        const targetNode = nodes.find((n) => n.id === childId);
        if (targetNode) {
          edges.push({
            type: "default",
            source: node.id,
            target: childId,
            id: `${node.id}-${childId}-${index}`,
            animated: true,
            style: {
              stroke: targetNode.data.category_color as string,
              strokeWidth: 6,
            },
          });
        }
      });
    }
  });
  return edges;
};

const Tree = (props: TreeProps) => {
  const [nodes, setNodes] = useState<CustomNode[]>(fallbackNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTreeData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching tree.json from GitHub...");

        // Fetch the tree.json file using the GitHub hook
        const treeJsonContent = await getFileContent(
          "data/learning-tree/tree.json"
        );

        if (!treeJsonContent) {
          console.warn("Could not fetch tree.json, using fallback nodes");
          setNodes(fallbackNodes);
          setEdges([]);
          return;
        }

        // Parse the JSON content
        const treeData: TreeJsonData = JSON.parse(treeJsonContent);
        console.log(
          `Loaded tree data with ${treeData.metadata.total_nodes} nodes across ${treeData.metadata.total_categories} categories`
        );

        // Transform and set the nodes
        const transformedNodes = transformTreeNodes(treeData);
        console.log(
          "First 10 node positions:",
          transformedNodes
            .slice(0, 10)
            .map((n) => ({ id: n.id, name: n.data.name, position: n.position }))
        );
        setNodes(transformedNodes);

        // Generate edges from the children relationships
        const generatedEdges = generateEdges(transformedNodes);
        setEdges(generatedEdges);

        // Update fit view to match old implementation (node 1 to max node ID)
        if (transformedNodes.length > 0) {
          const maxNodeId = Math.max(
            ...transformedNodes.map((node) => Number(node.id))
          );
          fitViewOptions.nodes = [{ id: "1" }, { id: maxNodeId.toString() }];
        }
      } catch (error) {
        console.error("Error loading tree data:", error);
        console.warn("Using fallback nodes due to error");
        setNodes(fallbackNodes);
        setEdges([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTreeData();
  }, []);

  // Handle specific node focus
  if (props.nodeID !== null) {
    fitViewOptions.nodes = [{ id: props.nodeID }];
  }

  return (
    <div className="tree">
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Loading Learning Tree...
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView={true}
        fitViewOptions={fitViewOptions}
        colorMode="dark"
        minZoom={0.001}
        maxZoom={2}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
      >
        <Background />
        <Controls showInteractive={true} />
      </ReactFlow>
    </div>
  );
};

export default Tree;

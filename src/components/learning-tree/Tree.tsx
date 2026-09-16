import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  PanOnScrollMode,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import LearningTreeNode from "./LearningTreeNode.tsx";
import CategoryGroupNode from "./CategoryGroupNode.tsx";
import CategoryContainerNode from "./CategoryContainerNode.tsx";
import "./assets/css/tree.css";
import { getFileContent } from "../../hooks/github-hook";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TreeProps {
  nodeID: string | null;
  expandedCategories: Set<string>;
  onExpandCategory: (name: string) => void;
  onCollapseCategory: (name: string) => void;
  /** When set, the tree will fitView to this category after the next rebuild. */
  focusCategoryName?: string | null;
  onClearFocus?: () => void;
  /** "compact" = collapsible category boxes (default). "full" = all nodes expanded. */
  viewMode?: "compact" | "full";
  onSetViewMode?: (mode: "compact" | "full") => void;
}

interface TreeJsonCategory {
  category_color: string;
  category_image?: string;
  /** Optional override: pin this category to a specific layout level. */
  category_level?: number;
  nodes: TreeJsonNode[];
}

interface TreeJsonData {
  categories: Record<string, TreeJsonCategory>;
  metadata: {
    total_nodes: number;
    total_categories: number;
    generated_at: string;
  };
}

interface TreeJsonNode {
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

// ─── Node types registration ──────────────────────────────────────────────────

const nodeTypes: NodeTypes = {
  treeNode: LearningTreeNode,
  categoryGroup: CategoryGroupNode,
  categoryContainer: CategoryContainerNode,
};

// ─── Category-level layout helpers ───────────────────────────────────────────

/**
 * Builds a directed graph between categories based on cross-category
 * parent→child node relationships.
 */
function buildCategoryAdjacency(treeData: TreeJsonData): {
  adj: Map<string, Set<string>>;
  incoming: Map<string, Set<string>>;
  nodeToCategory: Map<string, string>;
} {
  const nodeToCategory = new Map<string, string>();
  Object.entries(treeData.categories).forEach(([catName, catData]) => {
    catData.nodes.forEach((n) => nodeToCategory.set(n.id, catName));
  });

  const cats = Object.keys(treeData.categories);
  const adj = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();
  cats.forEach((c) => {
    adj.set(c, new Set());
    incoming.set(c, new Set());
  });

  cats.forEach((catName) => {
    treeData.categories[catName].nodes.forEach((node) => {
      node.children.forEach((childId) => {
        const childCat = nodeToCategory.get(childId);
        if (childCat && childCat !== catName) {
          adj.get(catName)!.add(childCat);
          incoming.get(childCat)!.add(catName);
        }
      });
    });
  });

  return { adj, incoming, nodeToCategory };
}

/**
 * Returns the pixel height a category occupies given its expanded state.
 * Collapsed boxes are 200 px tall (image + title strip, no external label).
 * Expanded boxes use the same formula as buildFlowGraph.
 */
function computeCategoryHeight(
  catData: TreeJsonCategory,
  isExpanded: boolean
): number {
  const COLLAPSED_H = 200;
  if (!isExpanded || catData.nodes.length === 0) return COLLAPSED_H;

  const internalNodes = layoutInternalNodes(catData.nodes, catData.category_color);
  const ys = internalNodes.map((n) => n.position.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys) + 280; // fixed bigtreenode height

  const V_PADDING = 80;
  const LABEL_HEIGHT = 50;
  return Math.max(maxY - minY + V_PADDING * 2 + LABEL_HEIGHT, 320);
}

/**
 * Assigns x/y positions to each category node using a proper Kahn's topological
 * sort so each category is processed exactly once — no infinite loops.
 *
 * When categories are expanded their actual visual height is used for vertical
 * spacing so that lower levels shift down to avoid overlap.
 */
function computeCategoryPositions(
  treeData: TreeJsonData,
  expandedCategories: Set<string>
): Map<string, { x: number; y: number }> {
  const { adj, incoming } = buildCategoryAdjacency(treeData);
  const cats = Object.keys(treeData.categories);

  // Track remaining in-degree so each node enters the queue exactly once
  const inDegree = new Map<string, number>();
  cats.forEach((c) => inDegree.set(c, incoming.get(c)!.size));

  const levels = new Map<string, number>();
  const queue: string[] = [];

  cats.forEach((c) => {
    if (inDegree.get(c) === 0) {
      queue.push(c);
      levels.set(c, 0);
    }
  });

  while (queue.length > 0) {
    const c = queue.shift()!;
    const curLevel = levels.get(c) ?? 0;

    adj.get(c)?.forEach((child) => {
      const existing = levels.get(child) ?? 0;
      levels.set(child, Math.max(existing, curLevel + 1));

      const deg = (inDegree.get(child) ?? 1) - 1;
      inDegree.set(child, deg);
      if (deg === 0) {
        queue.push(child);
      }
    });
  }

  // Anything left (cycles or true orphans) falls to level 0
  cats.forEach((c) => {
    if (!levels.has(c)) levels.set(c, 0);
  });

  // Apply explicit level overrides from tree.json (category_level field)
  cats.forEach((c) => {
    const override = treeData.categories[c].category_level;
    if (override !== undefined) levels.set(c, override);
  });

  // Group by level
  const byLevel = new Map<number, string[]>();
  cats.forEach((c) => {
    const lv = levels.get(c)!;
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(c);
  });

  const H_GAP = 100;
  const V_GAP = 80;

  // Per-category actual width (260 collapsed; expanded = container width)
  const catActualWidth = new Map<string, number>();
  cats.forEach((cat) => {
    const catData = treeData.categories[cat];
    if (!expandedCategories.has(cat) || catData.nodes.length === 0) {
      catActualWidth.set(cat, 260);
    } else {
      const internalNodes = layoutInternalNodes(catData.nodes, catData.category_color);
      const xs = internalNodes.map((n) => n.position.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs) + 170; // NODE_W
      catActualWidth.set(cat, Math.max(maxX - minX + 220 * 2, 320)); // 220 = H_PADDING
    }
  });

  // Per-level height = max height of any category on that level
  const levelHeights = new Map<number, number>();
  byLevel.forEach((catList, level) => {
    const maxH = Math.max(
      ...catList.map((cat) =>
        computeCategoryHeight(treeData.categories[cat], expandedCategories.has(cat))
      )
    );
    levelHeights.set(level, maxH);
  });

  // Cumulative y-start for each level
  const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => a - b);
  const levelYStart = new Map<number, number>();
  let cumY = 0;
  sortedLevels.forEach((lv) => {
    levelYStart.set(lv, cumY);
    cumY += (levelHeights.get(lv) ?? 200) + V_GAP;
  });

  const positions = new Map<string, { x: number; y: number }>();
  byLevel.forEach((catList, level) => {
    // Use actual widths per category so expanded containers don't overlap
    const widths = catList.map((cat) => catActualWidth.get(cat) ?? 260);
    const totalW =
      widths.reduce((s, w) => s + w, 0) + (catList.length - 1) * H_GAP;
    const yStart = levelYStart.get(level) ?? 0;
    let xOffset = -(totalW / 2);
    catList.forEach((cat, i) => {
      positions.set(cat, { x: xOffset, y: yStart });
      xOffset += widths[i] + H_GAP;
    });
  });

  return positions;
}

// ─── Internal (within-category) layout ───────────────────────────────────────

interface InternalNode {
  id: string;
  position: { x: number; y: number };
  data: {
    name: string;
    image_path: string;
    api_image_path: string;
    description: string;
    category: string;
    category_color: string;
    highlighted_path: string;
    link: string;
    [key: string]: unknown;
  };
  children: string[];
}

/**
 * Lays out nodes within a single category as a mini-tree.
 * Nodes whose parents are all outside the category are treated as roots.
 */
function layoutInternalNodes(
  catNodes: TreeJsonNode[],
  categoryColor: string
): InternalNode[] {
  const catNodeIds = new Set(catNodes.map((n) => n.id));
  const NODE_H_SPACING = 220;
  const LEVEL_V_SPACING = 300;

  const levelOf = new Map<string, number>();
  const visited = new Set<string>();

  // Find roots: nodes with no parents inside this category
  let roots = catNodes.filter((n) =>
    n.parents.every((pid) => !catNodeIds.has(pid))
  );
  if (roots.length === 0 && catNodes.length > 0) roots = [catNodes[0]];

  // BFS from roots
  const bfsQ: string[] = roots.map((r) => r.id);
  bfsQ.forEach((id) => {
    levelOf.set(id, 0);
    visited.add(id);
  });

  while (bfsQ.length > 0) {
    const id = bfsQ.shift()!;
    const node = catNodes.find((n) => n.id === id);
    if (!node) continue;
    node.children
      .filter((cid) => catNodeIds.has(cid) && !visited.has(cid))
      .forEach((cid) => {
        visited.add(cid);
        levelOf.set(cid, (levelOf.get(id) ?? 0) + 1);
        bfsQ.push(cid);
      });
  }
  // Orphans (disconnected within the category)
  catNodes
    .filter((n) => !visited.has(n.id))
    .forEach((n, i) => levelOf.set(n.id, -(i + 1)));

  // Group by level
  const byLevel = new Map<number, string[]>();
  catNodes.forEach((n) => {
    const lv = levelOf.get(n.id) ?? 0;
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(n.id);
  });

  // Assign x/y
  const posMap = new Map<string, { x: number; y: number }>();
  byLevel.forEach((ids, level) => {
    const totalW = ids.length * NODE_H_SPACING;
    ids.forEach((id, i) => {
      posMap.set(id, {
        x: -(totalW / 2) + i * NODE_H_SPACING + NODE_H_SPACING / 2,
        y: level * LEVEL_V_SPACING,
      });
    });
  });

  return catNodes.map((node) => ({
    id: node.id,
    position: posMap.get(node.id) ?? { x: 0, y: 0 },
    data: {
      name: node.name,
      image_path: node.api_image_path,
      api_image_path: node.api_image_path,
      description: node.description,
      category: node.category,
      category_color: categoryColor,
      highlighted_path: node.highlighted_path,
      link: node.link,
    },
    children: node.children,
  }));
}

// ─── Full-tree (all-nodes expanded) builder ───────────────────────────────────

/**
 * Reproduces the original learning-tree layout that existed before the compact
 * redesign, using the same position algorithm from the pre-refactor Tree.tsx:
 *
 *   x = tree.json position.x  (if non-zero), else average of parent x values
 *   y = tree.json position.y  (if non-zero), else firstParent.y + 500
 *
 * This matches what the original site displayed.
 */
function buildFullTreeGraph(
  treeData: TreeJsonData,
  onHoverStart: (id: string, rightShift: number, leftShift: number) => void,
  onHoverEnd: () => void
): { nodes: Node[]; edges: Edge[] } {
  // Collect all nodes with their source data
  const srcNodes: TreeJsonNode[] = [];
  const catColors = new Map<string, string>();

  Object.entries(treeData.categories).forEach(([, catData]) => {
    catData.nodes.forEach((n) => srcNodes.push(n));
    catData.nodes.forEach((n) => catColors.set(n.category, catData.category_color));
  });

  // Sort by numeric ID so parents are always processed before children
  srcNodes.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  // Build a map of computed positions (mirrors the original transformTreeNodes)
  const posMap = new Map<string, { x: number; y: number }>();

  srcNodes.forEach((node) => {
    if (node.id === "1") {
      posMap.set(node.id, { x: 0, y: 0 });
      return;
    }

    const parents = node.parents;
    if (parents.length === 0) {
      // Orphan — place at origin; rare but handled
      posMap.set(node.id, { x: node.position.x, y: node.position.y });
      return;
    }

    // x: use stored x when non-zero, otherwise average of parent x values
    const avgParentX =
      parents.reduce((sum, pid) => sum + (posMap.get(pid)?.x ?? 0), 0) /
      parents.length;
    const x = node.position.x !== 0 ? node.position.x : avgParentX;

    // y: use stored y when non-zero, otherwise firstParent.y + 500
    let y: number;
    if (node.position.y !== 0) {
      y = node.position.y;
    } else {
      const firstParentPos = posMap.get(parents[0]);
      y = (firstParentPos?.y ?? 0) + 500;
    }

    posMap.set(node.id, { x, y });
  });

  const rfNodes: Node[] = srcNodes.map((node) => ({
    id: node.id,
    type: "treeNode",
    position: posMap.get(node.id) ?? { x: 0, y: 0 },
    data: {
      name: node.name,
      image_path: node.api_image_path,
      api_image_path: node.api_image_path,
      description: node.description,
      category: node.category,
      category_color: catColors.get(node.category) ?? "gray",
      highlighted_path: node.highlighted_path,
      link: node.link,
      onHoverStart,
      onHoverEnd,
    },
    draggable: false,
  }));

  // Edges: color by target node's category color, stroke width 6 (matches original)
  const allNodeIds = new Set(srcNodes.map((n) => n.id));
  const rfEdges: Edge[] = [];
  srcNodes.forEach((node) => {
    node.children
      .filter((cid) => allNodeIds.has(cid))
      .forEach((cid, idx) => {
        const childColor = catColors.get(
          srcNodes.find((n) => n.id === cid)?.category ?? ""
        ) ?? "white";
        rfEdges.push({
          id: `full-${node.id}-${cid}-${idx}`,
          source: node.id,
          target: cid,
          type: "default",
          animated: true,
          style: { stroke: childColor, strokeWidth: 6 },
        });
      });
  });

  return { nodes: rfNodes, edges: rfEdges };
}

// ─── Main graph builder ───────────────────────────────────────────────────────

function buildFlowGraph(
  treeData: TreeJsonData,
  expandedCategories: Set<string>,
  onExpand: (name: string) => void,
  onCollapse: (name: string) => void,
  onHoverStart: (id: string, rightShift: number, leftShift: number) => void,
  onHoverEnd: () => void
): { nodes: Node[]; edges: Edge[] } {
  const { adj } = buildCategoryAdjacency(treeData);
  const categoryPositions = computeCategoryPositions(treeData, expandedCategories);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Map from category name → its ReactFlow node id (group or container)
  const catNodeIdMap = new Map<string, string>();

  Object.entries(treeData.categories).forEach(([catName, catData]) => {
    const pos = categoryPositions.get(catName) ?? { x: 0, y: 0 };

    if (!expandedCategories.has(catName)) {
      // ── Collapsed: single CategoryGroupNode ──────────────────────────────
      const nodeId = `cat-group-${catName}`;
      catNodeIdMap.set(catName, nodeId);
      nodes.push({
        id: nodeId,
        type: "categoryGroup",
        position: pos,
        data: {
          categoryName: catName,
          categoryColor: catData.category_color,
          categoryImage: catData.category_image ?? "",
          categoryNodes: catData.nodes.map((n) => ({
            id: n.id,
            name: n.name,
            link: n.link,
          })),
          onExpand,
          onHoverStart,
          onHoverEnd,
        },
        style: { width: 260, height: 200 },
        draggable: false,
      });
    } else {
      // ── Expanded: CategoryContainerNode + child treeNodes ────────────────
      const containerId = `cat-container-${catName}`;
      catNodeIdMap.set(catName, containerId);

      if (catData.nodes.length === 0) {
        nodes.push({
          id: containerId,
          type: "categoryContainer",
          position: pos,
          data: {
            categoryName: catName,
            categoryColor: catData.category_color,
            onCollapse,
          },
          style: { width: 260, height: 200 },
          zIndex: -1,
          draggable: false,
        });
        return;
      }

      const internalNodes = layoutInternalNodes(catData.nodes, catData.category_color);
      const catNodeIds = new Set(catData.nodes.map((n) => n.id));

      const H_PADDING = 220; // Wide enough for bigtreenode left:-10vw expansion
      const V_PADDING = 80;  // Normal vertical breathing room
      const LABEL_HEIGHT = 50;
      const NODE_W = 170;
      const NODE_H = 280; // Matches fixed bigtreenode height

      const xs = internalNodes.map((n) => n.position.x);
      const ys = internalNodes.map((n) => n.position.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs) + NODE_W;
      const maxY = Math.max(...ys) + NODE_H;

      const containerW = Math.max(maxX - minX + H_PADDING * 2, 320);
      const containerH = Math.max(
        maxY - minY + V_PADDING * 2 + LABEL_HEIGHT,
        320
      );

      nodes.push({
        id: containerId,
        type: "categoryContainer",
        position: pos,
        data: {
          categoryName: catName,
          categoryColor: catData.category_color,
          onCollapse,
        },
        style: { width: containerW, height: containerH },
        zIndex: -1,
        draggable: false,
      });

      // Child nodes positioned relative to the container
      internalNodes.forEach((iNode) => {
        nodes.push({
          id: iNode.id,
          type: "treeNode",
          position: {
            x: iNode.position.x - minX + H_PADDING,
            y: iNode.position.y - minY + LABEL_HEIGHT + V_PADDING / 2,
          },
          data: { ...iNode.data, onHoverStart, onHoverEnd },
          parentId: containerId,
          draggable: false,
          style: { width: NODE_W },
        });
      });

      // Edges connecting nodes within this category
      internalNodes.forEach((iNode) => {
        iNode.children
          .filter((cid) => catNodeIds.has(cid))
          .forEach((cid, idx) => {
            edges.push({
              id: `int-edge-${iNode.id}-${cid}-${idx}`,
              source: iNode.id,
              target: cid,
              type: "default",
              animated: true,
              style: { stroke: catData.category_color, strokeWidth: 4 },
            });
          });
      });
    }
  });

  // ── Inter-category edges (between group/container nodes) ─────────────────
  // Strategy: draw downward edges always.  For same-level (horizontal) edges,
  // only draw them when the row has ≤ 2 such connections — this keeps the
  // clean Supervised ↔ Unsupervised link while suppressing the noisy NLP
  // level (which has 6+ same-level connections).
  const sameLevelCountByY = new Map<number, number>();
  adj.forEach((childCats, parentCat) => {
    const sPos = categoryPositions.get(parentCat);
    childCats.forEach((childCat) => {
      const tPos = categoryPositions.get(childCat);
      if (sPos && tPos && sPos.y === tPos.y) {
        sameLevelCountByY.set(sPos.y, (sameLevelCountByY.get(sPos.y) ?? 0) + 1);
      }
    });
  });

  adj.forEach((childCats, parentCat) => {
    const sourceId = catNodeIdMap.get(parentCat);
    const sourcePos = categoryPositions.get(parentCat);
    childCats.forEach((childCat) => {
      const targetId = catNodeIdMap.get(childCat);
      const targetPos = categoryPositions.get(childCat);
      if (!sourceId || !targetId || !sourcePos || !targetPos) return;

      const isDownward = targetPos.y > sourcePos.y;
      const isSameLevel = targetPos.y === sourcePos.y;
      const sameRowCount = sameLevelCountByY.get(sourcePos.y) ?? 0;
      // Allow same-level edges only on rows with ≤ 2 such connections
      const allowSameLevel = isSameLevel && sameRowCount <= 2;

      if (!isDownward && !allowSameLevel) return;

      const childColor =
        treeData.categories[childCat]?.category_color ?? "white";
      edges.push({
        id: `cat-edge-${parentCat}-${childCat}`,
        source: sourceId,
        target: targetId,
        type: "default",
        animated: true,
        style: { stroke: childColor, strokeWidth: 3, opacity: 0.75 },
      });
    });
  });

  return { nodes, edges };
}

// ─── Tree component ───────────────────────────────────────────────────────────

const Tree = ({
  nodeID,
  expandedCategories,
  onExpandCategory,
  onCollapseCategory,
  focusCategoryName,
  onClearFocus,
  viewMode = "compact",
  onSetViewMode,
}: TreeProps) => {
  const [treeData, setTreeData] = useState<TreeJsonData | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  // Hover shifting: rightShift/leftShift are independent so heading nodes (right-only)
  // and tree nodes (both sides) can behave differently.
  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    rightShift: number;
    leftShift: number;
  } | null>(null);

  const handleHoverStart = useCallback((id: string, rightShift: number, leftShift: number) => {
    setHoveredNode({ id, rightShift, leftShift });
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Clear hover state whenever the graph rebuilds
  useEffect(() => { setHoveredNode(null); }, [nodes]);

  const displayNodes = useMemo(() => {
    if (!hoveredNode) return nodes;
    const hovered = nodes.find((n) => n.id === hoveredNode.id);
    if (!hovered) return nodes;

    const hx = hovered.position.x;
    const hy = hovered.position.y;
    const hw = (hovered.style?.width as number) || 170;
    const hoveredCenterX = hx + hw / 2;

    if (hovered.parentId) {
      // ── Child node inside an expanded container ──────────────────────────
      // Shift only siblings in the same container; positions are container-relative.
      return nodes.map((n) => {
        if (n.id === hoveredNode.id || n.parentId !== hovered.parentId) return n;
        const nw = (n.style?.width as number) || 170;
        const nCenterX = n.position.x + nw / 2;
        if (nCenterX > hoveredCenterX) {
          return { ...n, position: { x: n.position.x + hoveredNode.rightShift, y: n.position.y } };
        } else if (nCenterX < hoveredCenterX) {
          return { ...n, position: { x: n.position.x - hoveredNode.leftShift, y: n.position.y } };
        }
        return n;
      });
    }

    // ── Top-level node ────────────────────────────────────────────────────
    const Y_TOLERANCE = 150;
    return nodes.map((n) => {
      if (n.id === hoveredNode.id || n.parentId) return n;
      if (Math.abs(n.position.y - hy) > Y_TOLERANCE) return n;
      const nw = (n.style?.width as number) || 170;
      const nCenterX = n.position.x + nw / 2;
      if (nCenterX > hoveredCenterX) {
        return { ...n, position: { x: n.position.x + hoveredNode.rightShift, y: n.position.y } };
      } else if (nCenterX < hoveredCenterX && hoveredNode.leftShift > 0) {
        return { ...n, position: { x: n.position.x - hoveredNode.leftShift, y: n.position.y } };
      }
      return n;
    });
  }, [nodes, hoveredNode]);

  // Fetch tree.json once on mount
  useEffect(() => {
    let cancelled = false;

    const loadTreeData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const content = await getFileContent("data/learning-tree/tree.json");
        if (cancelled) return;

        if (!content) {
          setLoadError(
            "Could not load tree data. Make sure maic-content is running on port 8000."
          );
          return;
        }

        const data: TreeJsonData = JSON.parse(content);
        if (!data.categories || Object.keys(data.categories).length === 0) {
          setLoadError("Tree data is missing categories.");
          return;
        }

        setTreeData(data);
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading tree data:", error);
          setLoadError("Failed to parse tree data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTreeData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Full tree rebuild — only re-runs when treeData or viewMode changes,
  // NOT when expandedCategories changes (avoids overriding category focus zoom)
  useEffect(() => {
    if (!treeData || viewMode !== "full") return;
    const { nodes: newNodes, edges: newEdges } = buildFullTreeGraph(treeData, handleHoverStart, handleHoverEnd);
    setNodes(newNodes);
    setEdges(newEdges);
    const doFit = () => {
      if (!nodeID) reactFlowInstance.current?.fitView({ duration: 600, padding: 0.1 });
    };
    const t1 = setTimeout(doFit, 100);
    const t2 = setTimeout(doFit, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData, viewMode]);

  // Compact tree rebuild — re-runs when expandedCategories changes
  useEffect(() => {
    if (!treeData || viewMode !== "compact") return;
    const { nodes: newNodes, edges: newEdges } = buildFlowGraph(
      treeData,
      expandedCategories,
      onExpandCategory,
      onCollapseCategory,
      handleHoverStart,
      handleHoverEnd
    );
    setNodes(newNodes);
    setEdges(newEdges);
    const doFit = () => {
      if (!nodeID) reactFlowInstance.current?.fitView({ duration: 600, padding: 0.1 });
    };
    const t1 = setTimeout(doFit, 100);
    const t2 = setTimeout(doFit, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData, expandedCategories, viewMode]);

  // Focus on a specific node when nodeID changes
  useEffect(() => {
    if (nodeID && reactFlowInstance.current && nodes.length > 0) {
      reactFlowInstance.current.fitView({
        nodes: [{ id: nodeID }],
        minZoom: 0.001,
        maxZoom: 0.7,
        duration: 800,
      });
    }
  }, [nodeID, nodes]);

  // Scroll to a category when it is selected from the sidebar
  useEffect(() => {
    if (!focusCategoryName || nodes.length === 0) return;

    const timer = setTimeout(() => {
      if (!reactFlowInstance.current) return;

      if (viewMode === "full") {
        // Zoom to all nodes belonging to this category
        const categoryNodeIds = nodes
          .filter((n) => (n.data as { category?: string })?.category === focusCategoryName)
          .map((n) => ({ id: n.id }));

        if (categoryNodeIds.length > 0) {
          reactFlowInstance.current.fitView({
            nodes: categoryNodeIds,
            duration: 700,
            padding: 0.25,
            minZoom: 0.1,
            maxZoom: 0.6,
          });
        }
      } else {
        // Zoom to the compact category group/container node
        const catNodeId = expandedCategories.has(focusCategoryName)
          ? `cat-container-${focusCategoryName}`
          : `cat-group-${focusCategoryName}`;

        reactFlowInstance.current.fitView({
          nodes: [{ id: catNodeId }],
          duration: 700,
          padding: 0.35,
          minZoom: 0.2,
          maxZoom: 0.85,
        });
      }
      onClearFocus?.();
    }, 220);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCategoryName, nodes, viewMode]);

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
      {loadError && !isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            color: "#fca5a5",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center",
            maxWidth: "420px",
            padding: "0 16px",
          }}
        >
          {loadError}
        </div>
      )}
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        colorMode="dark"
        minZoom={0.001}
        maxZoom={2}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        onInit={(instance) => {
          reactFlowInstance.current = instance as ReactFlowInstance<Node, Edge>;
        }}
      >
        <Background />
        <Controls showInteractive={true} />
      </ReactFlow>
    </div>
  );
};

export default Tree;

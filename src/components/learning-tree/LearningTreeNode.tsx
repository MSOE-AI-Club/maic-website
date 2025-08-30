import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Box from "@mui/material/Box";
import { type Node, type NodeProps } from "@xyflow/react";
import { Position, Handle } from "@xyflow/react";
import { getRawFileUrl } from "../../hooks/github-hook";
import { getColorScheme } from "./colorUtils";
import "./assets/css/learningTreeNode.css";

//This type, defines the props that are able to be passed down to the treeNode
type treeNode = Node<
  {
    name: string;
    image_path: string;
    api_image_path: string;
    description: string;
    category: string;
    category_color: string;
    highlighted_path: string;
    position?: string;
    link: string;
  },
  "treeNode"
>;

const LearningTreeNode = ({ data }: NodeProps<treeNode>) => {
  // State for managing the resolved image URL
  const [imageUrl, setImageUrl] = useState<string>(
    "https://via.placeholder.com/200x150?text=Loading..."
  );

  // Load the image URL from GitHub on component mount
  useEffect(() => {
    const loadImageUrl = async () => {
      // Check if image_path is a full URL (starts with http)
      if (
        data.image_path &&
        data.image_path.trim() !== "" &&
        data.image_path !== "string" &&
        (data.image_path.startsWith("http://") ||
          data.image_path.startsWith("https://"))
      ) {
        // Use direct URL if it's a full URL
        setImageUrl(data.image_path);
        return;
      }

      // Otherwise, load from GitHub using api_image_path
      if (!data.api_image_path || data.api_image_path.trim() === "") {
        // Use placeholder if no image path is provided
        setImageUrl("https://via.placeholder.com/200x150?text=No+Image");
        return;
      }

      try {
        const githubImageUrl = await getRawFileUrl(data.api_image_path);
        if (githubImageUrl) {
          setImageUrl(githubImageUrl);
        } else {
          // Fallback to placeholder if GitHub URL couldn't be generated
          console.warn(
            `Could not generate GitHub URL for image: ${data.api_image_path}`
          );
          setImageUrl(
            "https://via.placeholder.com/200x150?text=Image+Not+Found"
          );
        }
      } catch (error) {
        console.error("Error loading image URL:", error);
        setImageUrl("https://via.placeholder.com/200x150?text=Error+Loading");
      }
    };

    loadImageUrl();
  }, [data.api_image_path, data.image_path, data.name]);

  // Get color scheme using utility function
  const colorScheme = getColorScheme(data.category_color);
  const { baseColor, gradientTop, gradientBottom, textColor } = colorScheme;

  const [state, setState] = useState({
    raised: false,
    className: "smalltreenode",
  });

  const isMobile = () => window.innerWidth <= 768;

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile()) {
      e.preventDefault();
      e.stopPropagation();
      window.open(data.link, '_blank');
    }
  };

  const card = [];
  if (state.raised) {
    // Big Node Content
    card.push(
      <CardActionArea 
        href={!isMobile() ? data.link : undefined}
        onClick={handleClick}
        sx={{ 
          color: `${textColor} !important`,
          '& *': { color: `${textColor} !important` }
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5, height: '100%' }}>
          {/* Left Side: Image and Title */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <CardMedia
                component="img"
                height="100%"
                image={
                  imageUrl
                }
                alt="Image"
                sx={{ borderRadius: 2, objectFit: 'cover', width: '100%' }}
              />
            </Box>
            <Box>
              <CardContent>
                <div className="title">
                  {data.name}
                </div>
              </CardContent>
            </Box>
          </Box>

          {/* Right Side: Description and Category */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <CardContent>
                <div>
                  {data.description}
                </div>
              </CardContent>
            </Box>
            <Box>
                <Chip
                    sx={{
                    backgroundColor: baseColor,
                    color: textColor,
                    borderRadius: 4,
                    mb: 0 // Reduced margin-bottom to bring the text closer to the chip
                    }}
                    size="medium"
                    label={data.category}
                />
                <Typography
                    variant="body2" // Adjust this variant to change the font size and style
                    sx={{ mb: 3, fontSize: 14, fontStyle: 'italic', fontWeight: 'bold' }}
                >
                    Click to learn more!
                </Typography>
            </Box>
          </Box>
        </Box>
      </CardActionArea>
    );
  } else {
    // Small Node Content
    card.push(
      <CardActionArea 
        href={!isMobile() ? data.link : undefined}
        onClick={handleClick}
        sx={{ 
          color: `${textColor} !important`,
          '& *': { color: `${textColor} !important` }
        }}
      >
        <CardMedia
          component="img"
          height="150"
          image={
            imageUrl
          }
          alt="Image"
          sx= {{mb: -1.5}}
        />
        <CardContent>
          <div className="title">
            {data.name}
          </div>
        </CardContent>
      </CardActionArea>
    );
  }

  return (
    <div className={state.className}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: baseColor, visibility: "hidden" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={true}
      />
      <Card
        className="learning-tree-card"
        sx={{
          border: 2,
          borderRadius: 2,
          borderColor: baseColor,
          background: `linear-gradient(to top, ${gradientBottom}, ${gradientTop})`,
          color: textColor,
        }}
        onMouseOver={() => {
          if (!isMobile()) {
            setState({ raised: true, className: "bigtreenode" });
          }
        }}
        onMouseOut={() => {
          if (!isMobile()) {
            setState({ raised: false, className: "smalltreenode" });
          }
        }}
        onTouchStart={(e) => e.preventDefault()}
        onTouchEnd={(e) => e.preventDefault()}
        raised={state.raised}
      >
        {card}
      </Card>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: baseColor, visibility: "hidden" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={true}
      />
    </div>
  );
};

export default LearningTreeNode;

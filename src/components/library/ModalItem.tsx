import { Button, Skeleton } from "@mui/material";
import "./assets/library/css/modal.css";
import tempImage from "./assets/library/images/temp-image.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * The ModalItemProps interface represents the props that the ModalItem component receives.
 */
interface ModalItemProps {
  articleId?: string;
  title?: string;
  authors?: string;
  img?: string;
  dataType?: string;
  openPreview?: (articleId: string) => boolean;
  columns: number;
  type?: string;
}

/**
 * Checks if an image exists at the given URL.
 * @param {string} url - The URL of the image to check.
 * @param {void} callback - The callback function to execute after checking the image.
 */
function checkImage(url: string, callback: (exists: boolean) => void): void {
  const img = new Image();

  img.onload = function () {
    callback(true);
  };

  img.onerror = function () {
    callback(false);
  };

  img.src = url;
}

/**
 * The ModalItem component displays an item in the modal with the given article ID.
 * @param {ModalItemProps} props - The props to be passed to the ModalItem component.
 * @returns {JSX.Element} The ModalItem component.
 */
const ModalItem = (props: ModalItemProps) => {
  /**
   * The states of the ModalItem component, including the title, authors, and image of the article.
   * Also the navigate function to navigate to the article page.
   */
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>(props.title || "No title found");
  const [authors, setAuthors] = useState<string>(
    props.authors || "No associated authors"
  );
  const [type, setType] = useState<string>(props.dataType || "md");
  const [img, setImg] = useState<any>(
    props.img ? props.img : (
      <Skeleton
        variant="rectangular"
        width={"100%"}
        height={"100%"}
        sx={{ minWidth: "20vh", minHeight: "20vh" }}
      />
    )
  );

  function handleRedict() {
    if (type.toLowerCase() === "video") {
      navigate(`/library?nav=Videos&article=${props.articleId}`);
    } else if (type.includes("anchor")) {
      const navLoc = type.split(" - ")[1];
      navigate(
        `/library?nav=${navLoc}#${title.toLowerCase().replace(/ /g, "-")}`
      );
    } else if (type.toLowerCase() === "marimo") {
      navigate(`/library?nav=Workshops&article=${props.articleId}`);
    } else if (type.includes("anchor")) {
      const navLoc = type.split(" - ")[1];
      navigate(
        `/library?nav=${navLoc}#${encodeURIComponent(title)}`
      );
    } else {
      if (props.openPreview && props.articleId) {
        if (props.openPreview(props.articleId)) {
          navigate(`/library?nav=Articles&article=${props.articleId}`);
        }
      }
    }
  }

  /**
   * The ModalItem component.
   */
  return (
    <Button
      sx={{
        width: "100%",
        flex: `1 0 ${100 / props.columns}%`,
        padding: props.type === "decorative" ? "initial" : "0",
      }}
      onClick={() => handleRedict()}
    >
      {" "}
      {props.type !== "decorative" ? (
        <div style={{ padding: "1rem" }} id={props.articleId}>
          {typeof img === "string" ? (
            <img
              src={img}
              alt="Preview"
              style={{
                width: "auto",
                maxHeight: "20vh",
                maxWidth: "20vh",
                objectFit: "fill",
              }}
              className={props.articleId}
              loading="lazy"
            ></img>
          ) : (
            img
          )}
          <div>
            <h3 className="modal-item-header">{title}</h3>
            <p className="authors">{authors}</p>
          </div>
        </div>
      ) : (
        <div
          style={{
            overflow: "hidden",
            height: "35vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
          }}
          id={props.articleId}
        >
          {typeof img === "string" ? (
            <img
              src={img}
              alt="Preview"
              style={{
                width: "100%",
              }}
              className={props.articleId}
              loading="lazy"
            ></img>
          ) : (
            img
          )}
          <div
            style={{
              position: "absolute",
              background: "linear-gradient(to bottom, transparent, black)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              height: "50%",
              width: "100%",
              bottom: "0",
            }}
          >
            <h3
              style={{ textAlign: "center", color: "white" }}
              className="modal-item-header"
            >
              {title}
            </h3>
            <p
              style={{ textAlign: "center", marginBottom: "1rem" }}
              className="authors"
            >
              {authors}
            </p>
          </div>
        </div>
      )}
    </Button>
  );
};

export default ModalItem;

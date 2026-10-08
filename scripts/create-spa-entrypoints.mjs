import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const routes = [
  "about",
  "achievements",
  "contact",
  "events",
  "learning-tree",
  "library",
  "merch",
  "points",
];

const outputDirectory = "dist";
const entrypoint = join(outputDirectory, "index.html");

await Promise.all(
  routes.map(async (route) => {
    const routeDirectory = join(outputDirectory, route);
    await mkdir(routeDirectory, { recursive: true });
    await copyFile(entrypoint, join(routeDirectory, "index.html"));
  }),
);

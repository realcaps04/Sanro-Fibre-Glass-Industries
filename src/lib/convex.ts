import { ConvexReactClient } from "convex/react";

export const convexUrl =
  import.meta.env.VITE_CONVEX_URL || "https://cheerful-rat-130.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);

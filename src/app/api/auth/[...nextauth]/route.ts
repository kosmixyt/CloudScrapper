import { handlers } from "~/server/auth";
// Explicitly set the Webpack bindings for React Server Components
// process.env.NEXT_RUNTIME = "edge"; // Ensure the runtime is set to edge for Webpack

const { GET, POST } = handlers;

export { GET, POST };

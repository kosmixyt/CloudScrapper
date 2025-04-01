import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

// Add logging for debugging
console.log("Setting up NextAuth with config:", {
  providers: authConfig.providers.map((p) => p.id || "unknown"),
  callbacksConfigured: !!authConfig.callbacks,
  secretConfigured: !!authConfig.secret,
});

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };

# Forme Convex backend

Convex stores one private triathlon training profile per authenticated Clerk user. `profiles.get` and `profiles.save` require a Clerk-authenticated identity and use its subject to scope reads and writes.

## Set up a deployment

1. Install dependencies with `npm install`, then run `npx convex dev` and sign in or create a Convex account when prompted. Select or create a project; Convex writes the local deployment URL to `.env.local`.
2. In Clerk, create a JWT template named `convex` for the Convex application. Keep its issuer set to your Clerk instance and set the audience to `convex`.
3. Set the Clerk issuer URL when starting Convex. It must match the issuer shown in Clerk:

   ```sh
   CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-instance.clerk.accounts.dev npx convex dev
   ```

   Use the issuer URL shown by Clerk for the instance connected to the app (production Clerk instances have a different issuer). Prefix `npx convex deploy` with the production issuer for production deploys.
4. Copy the deployment URL from Convex into the frontend's `VITE_CONVEX_URL`. Set the Clerk publishable key as `VITE_CLERK_PUBLISHABLE_KEY`.
5. In Clerk, enable Google, Facebook, and Apple social connections and configure their provider credentials and redirect URLs. Clerk controls which providers appear on the frontend sign-in screen.

The schema and queries deploy automatically while `npx convex dev` is running. Use `CLERK_JWT_ISSUER_DOMAIN=https://your-production-clerk-issuer npx convex deploy` for production.

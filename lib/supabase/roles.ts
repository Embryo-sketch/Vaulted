/** Returns true only for a protected Supabase app-metadata admin role. */
export function isAdmin(metadata: unknown) {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "role" in metadata &&
    metadata.role === "admin"
  );
}

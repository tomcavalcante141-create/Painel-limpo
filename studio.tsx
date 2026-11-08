import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StudioHydrate } from "@/components/studio-hydrate";

export const Route = createFileRoute("/studio")({
  component: StudioLayout,
});

function StudioLayout() {
  return (
    <StudioHydrate>
      <Outlet />
    </StudioHydrate>
  );
}

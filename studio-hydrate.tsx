import { useEffect, useState, type ReactNode } from "react";
import { useStudioStore } from "@/lib/store";

export function StudioHydrate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => {
      useStudioStore.getState().ensureSeed();
      setReady(true);
    };
    const unsub = useStudioStore.persist.onFinishHydration(finish);
    void useStudioStore.persist.rehydrate();
    if (useStudioStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-muted">
        <p className="font-display text-lg">Abrindo o estúdio…</p>
      </div>
    );
  }

  return children;
}

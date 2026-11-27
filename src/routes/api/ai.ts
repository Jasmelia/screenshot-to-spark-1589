import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleAi } = await import("@/lib/ai/handler.server");
        return handleAi(request);
      },
    },
  },
});

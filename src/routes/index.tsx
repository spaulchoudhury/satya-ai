import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/obesity/Dashboard";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Satya — Obesity Detection & Prevention" },
      {
        name: "description",
        content:
          "AI-powered obesity risk detection combining genetic, lifestyle and wearable data — treat before treatment.",
      },
    ],
  }),
});

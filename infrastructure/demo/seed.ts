import type { WorkspaceState } from "@/domain/workspace/models";
export const seed: WorkspaceState = {
  preferences: {
    work: "Brand identity & design",
    tone: "Warm & thoughtful",
    style: "Editorial",
    font: "Georgia",
    color: "#7357c8",
    start: "09:00",
    end: "17:00",
  },
  projects: [
    {
      id: "p1",
      name: "A new chapter for Olive",
      client: "Olive Studio",
      email: "hello@example.com",
      description:
        "A thoughtful identity for a slow-living ceramics studio. Earthy, tactile, and a little unexpected.",
      status: "In progress",
      priority: "High",
      deadline: "2026-10-23",
      color: "purple",
      notes:
        "A small-batch ceramics studio. The identity should feel warm, grounded and quietly confident. Audience and positioning still need clarification.",
      conversation: [
        "Exploring a softer wordmark and a warmer palette. Bring both directions to the next check-in.",
      ],
      tasks: [
        {
          id: "t1",
          title: "Moodboard exploration",
          date: "2026-10-12",
          duration: 2,
          done: false,
        },
        {
          id: "t2",
          title: "Identity concepts",
          date: "2026-10-14",
          duration: 4,
          done: false,
        },
        {
          id: "t3",
          title: "Present brand direction",
          date: "2026-10-16",
          duration: 1,
          done: false,
        },
        {
          id: "t4",
          title: "Brand discovery",
          date: "2026-10-08",
          duration: 2,
          done: true,
        },
      ],
    },
    {
      id: "p2",
      name: "Good things, bottled",
      client: "Folk & Form",
      email: "client@example.com",
      description:
        "Packaging and art direction for a botanical drinks collection.",
      status: "In progress",
      priority: "Medium",
      deadline: "2026-10-28",
      color: "orange",
      notes:
        "Botanical ingredients, joyful rituals. Packaging must stand out on a crowded shelf.",
      conversation: [],
      tasks: [
        {
          id: "t5",
          title: "Packaging sketches",
          date: "2026-10-13",
          duration: 3,
          done: false,
        },
        {
          id: "t6",
          title: "Refine label designs",
          date: "2026-10-20",
          duration: 3,
          done: false,
        },
      ],
    },
    {
      id: "p3",
      name: "Make room for Morrow",
      client: "Morrow",
      email: "morrow@example.com",
      description:
        "Brand strategy for a new community-centered architecture practice.",
      status: "Review",
      priority: "Medium",
      deadline: "2026-10-30",
      color: "green",
      notes:
        "Designing spaces around people. Need to confirm the primary audience and differentiators.",
      conversation: [],
      tasks: [
        {
          id: "t7",
          title: "Strategy review",
          date: "2026-10-15",
          duration: 1.5,
          done: false,
        },
        {
          id: "t8",
          title: "Research & discovery",
          date: "2026-10-09",
          duration: 3,
          done: true,
        },
      ],
    },
  ],
  activity: [
    {
      id: "a1",
      projectId: "p1",
      text: "Completed Brand discovery",
      at: "2026-10-08T14:30:00",
    },
    {
      id: "a2",
      projectId: "p3",
      text: "Completed Research & discovery",
      at: "2026-10-09T16:00:00",
    },
    {
      id: "a3",
      projectId: "p2",
      text: "Created Good things, bottled",
      at: "2026-10-10T09:00:00",
    },
  ],
};

export const demoEvents = [
  {
    id: "meeting1",
    date: "2026-10-14",
    title: "Olive · Creative check-in",
    color: "purple",
    projectId: "p1",
    type: "Meetings",
    time: "10:00 AM",
  },
  {
    id: "meeting2",
    date: "2026-10-19",
    title: "Folk & Form · Catch-up",
    color: "orange",
    projectId: "p2",
    type: "Meetings",
    time: "2:00 PM",
  },
  {
    id: "personal1",
    date: "2026-10-16",
    title: "An afternoon to recharge",
    color: "neutral",
    type: "Personal",
    time: "3:00 PM",
  },
];

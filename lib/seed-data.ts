import type { Issue } from "@/types";

/**
 * Phase 1 demo dataset — MOCK DATA ONLY.
 *
 * These seeded civic issues make the map look alive on first load (no empty
 * prototype) and are spread across five Indian cities:
 * Delhi, Mumbai, Hyderabad, Bengaluru, Mysuru.
 *
 * The same dataset is pushed to Firestore by `scripts/seed.ts` (Phase 2+),
 * but the map reads it directly in Phase 1 so it works with zero backend.
 */
export const SEED_ISSUES: Issue[] = [
  // ----------------------------- Delhi -----------------------------
  {
    id: "seed-del-1",
    category: "pothole",
    title: "Large pothole near Connaught Place",
    description:
      "Deep pothole on the inner circle road causing two-wheelers to swerve into traffic.",
    location: {
      lat: 28.6315,
      lng: 77.2167,
      city: "Delhi",
      address: "Connaught Place, New Delhi",
    },
    status: "reported",
    severityScore: 82,
    severityLabel: "high",
    upvotes: 24,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-20T09:15:00.000Z",
    updatedAt: "2026-06-20T09:15:00.000Z",
  },
  {
    id: "seed-del-2",
    category: "streetlight",
    title: "Streetlights out on Ring Road stretch",
    description:
      "A 200m stretch has had no working streetlights for over a week, unsafe at night.",
    location: {
      lat: 28.6692,
      lng: 77.2265,
      city: "Delhi",
      address: "Ring Road, Delhi",
    },
    status: "in_progress",
    severityScore: 58,
    severityLabel: "medium",
    upvotes: 11,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-18T19:40:00.000Z",
    updatedAt: "2026-06-22T11:00:00.000Z",
  },

  // ----------------------------- Mumbai ----------------------------
  {
    id: "seed-mum-1",
    category: "water_leak",
    title: "Burst water pipeline in Andheri West",
    description:
      "Continuous water flow onto the road for 3 days; significant wastage and slippery surface.",
    location: {
      lat: 19.1351,
      lng: 72.8267,
      city: "Mumbai",
      address: "Andheri West, Mumbai",
    },
    status: "verified",
    severityScore: 88,
    severityLabel: "critical",
    upvotes: 41,
    clusterId: null,
    inputType: "voice",
    mediaUrl: null,
    createdAt: "2026-06-21T07:05:00.000Z",
    updatedAt: "2026-06-22T08:30:00.000Z",
  },
  {
    id: "seed-mum-2",
    category: "garbage",
    title: "Overflowing garbage bins in Dadar",
    description:
      "Uncollected waste near the market for several days, attracting strays and odour.",
    location: {
      lat: 19.0186,
      lng: 72.8421,
      city: "Mumbai",
      address: "Dadar, Mumbai",
    },
    status: "resolved",
    severityScore: 45,
    severityLabel: "medium",
    upvotes: 17,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-15T13:20:00.000Z",
    updatedAt: "2026-06-19T16:10:00.000Z",
  },

  // ---------------------------- Hyderabad --------------------------
  {
    id: "seed-hyd-1",
    category: "drainage",
    title: "Clogged drainage flooding the lane in Madhapur",
    description:
      "Stormwater drain blocked; the lane floods even with light rain.",
    location: {
      lat: 17.4483,
      lng: 78.3915,
      city: "Hyderabad",
      address: "Madhapur, Hyderabad",
    },
    status: "assigned",
    severityScore: 71,
    severityLabel: "high",
    upvotes: 19,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-19T10:50:00.000Z",
    updatedAt: "2026-06-21T09:00:00.000Z",
  },
  {
    id: "seed-hyd-2",
    category: "pothole",
    title: "Pothole cluster near Gachibowli flyover",
    description:
      "Several potholes along the service road slowing traffic and risking accidents.",
    location: {
      lat: 17.4401,
      lng: 78.3489,
      city: "Hyderabad",
      address: "Gachibowli, Hyderabad",
    },
    status: "reported",
    severityScore: 64,
    severityLabel: "medium",
    upvotes: 8,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-22T06:30:00.000Z",
    updatedAt: "2026-06-22T06:30:00.000Z",
  },

  // ---------------------------- Bengaluru --------------------------
  {
    id: "seed-blr-1",
    category: "pothole",
    title: "Crater-sized pothole on Outer Ring Road",
    description:
      "Major pothole near Marathahalli causing daily traffic snarls during peak hours.",
    location: {
      lat: 12.9568,
      lng: 77.7011,
      city: "Bengaluru",
      address: "Marathahalli, Bengaluru",
    },
    status: "in_progress",
    severityScore: 90,
    severityLabel: "critical",
    upvotes: 53,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-17T08:00:00.000Z",
    updatedAt: "2026-06-23T10:15:00.000Z",
  },
  {
    id: "seed-blr-2",
    category: "streetlight",
    title: "Dark stretch near Koramangala 5th block",
    description:
      "Streetlights non-functional near the park, residents report safety concerns.",
    location: {
      lat: 12.9352,
      lng: 77.6245,
      city: "Bengaluru",
      address: "Koramangala, Bengaluru",
    },
    status: "verified",
    severityScore: 49,
    severityLabel: "medium",
    upvotes: 14,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-20T20:10:00.000Z",
    updatedAt: "2026-06-21T18:45:00.000Z",
  },
  {
    id: "seed-blr-3",
    category: "garbage",
    title: "Garbage dumping at vacant plot in HSR Layout",
    description:
      "Unauthorised dumping growing daily; needs clearance and signage.",
    location: {
      lat: 12.9116,
      lng: 77.6412,
      city: "Bengaluru",
      address: "HSR Layout, Bengaluru",
    },
    status: "reported",
    severityScore: 38,
    severityLabel: "low",
    upvotes: 6,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-23T07:25:00.000Z",
    updatedAt: "2026-06-23T07:25:00.000Z",
  },

  // ------------------------------ Mysuru ---------------------------
  {
    id: "seed-mys-1",
    category: "water_leak",
    title: "Leaking valve near Mysuru Palace road",
    description:
      "Steady leak from a supply valve wasting water along the tourist route.",
    location: {
      lat: 12.3052,
      lng: 76.6552,
      city: "Mysuru",
      address: "Palace Road, Mysuru",
    },
    status: "assigned",
    severityScore: 60,
    severityLabel: "medium",
    upvotes: 9,
    clusterId: null,
    inputType: "voice",
    mediaUrl: null,
    createdAt: "2026-06-21T11:35:00.000Z",
    updatedAt: "2026-06-22T12:20:00.000Z",
  },
  {
    id: "seed-mys-2",
    category: "drainage",
    title: "Open drain near Kuvempunagar",
    description:
      "Uncovered drain on a residential street poses a hazard for children.",
    location: {
      lat: 12.2829,
      lng: 76.6196,
      city: "Mysuru",
      address: "Kuvempunagar, Mysuru",
    },
    status: "resolved",
    severityScore: 55,
    severityLabel: "medium",
    upvotes: 12,
    clusterId: null,
    inputType: "photo",
    mediaUrl: null,
    createdAt: "2026-06-14T09:00:00.000Z",
    updatedAt: "2026-06-18T15:30:00.000Z",
  },
];

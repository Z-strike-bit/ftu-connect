"use client";

export default function TierBadge({ tier }: { tier: 1 | 2 }) {
  if (tier === 2) {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">Tier 2 · Verified</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">Tier 1</span>;
}

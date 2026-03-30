// apps/web/src/components/layout/top-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavEntry = {
  label: string;
  href: string;
};

const NAV_ITEMS: NavEntry[] = [
  { label: "Overview", href: "/" },
  { label: "Definition", href: "/definition" },
  { label: "Execution", href: "/execution" },
  { label: "Knowledge", href: "/knowledge" },
  { label: "Settings", href: "/settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        padding: "0 20px",
        borderBottom: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "grid", gap: 2, minWidth: 140 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          AI SDLC
        </span>
        <span style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
          Workspace
        </span>
      </div>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 800 : 600,
                color: active ? "#2563eb" : "#475569",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
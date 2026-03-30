//apps/web/src/components/ui/empty-state.tsx
"use client";

export function EmptyState({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(147,51,234,0.12))",
            border: "1px solid #dbeafe",
          }}
        />
        <h3
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.7,
            color: "#64748b",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
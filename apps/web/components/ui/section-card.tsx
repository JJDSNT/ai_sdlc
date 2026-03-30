//apps/web/src/components/ui/section-card.tsx
"use client";

export function SectionCard({
  title,
  subtitle,
  children,
  actions,
}: Readonly<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}>) {
  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {title}
          </h2>

          {subtitle ? (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                lineHeight: 1.5,
                color: "#64748b",
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {actions ? <div>{actions}</div> : null}
      </div>

      {children}
    </section>
  );
}
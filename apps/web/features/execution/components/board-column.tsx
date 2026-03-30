// apps/web/features/execution/components/board-column.tsx

type Props = Readonly<{
  title: string;
  count: number;
  children: React.ReactNode;
}>;

export function BoardColumn({ title, count, children }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        alignContent: "start",
        padding: 14,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "rgba(255,255,255,0.88)",
        minHeight: 420,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
          {title}
        </div>

        <span
          style={{
            minWidth: 28,
            height: 28,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 12,
            fontWeight: 800,
            color: "#475569",
          }}
        >
          {count}
        </span>
      </div>

      {children}
    </div>
  );
}
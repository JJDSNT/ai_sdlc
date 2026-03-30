// apps/web/features/execution/components/metric.tsx

type Props = Readonly<{
  label: string;
  value: string;
  danger?: boolean;
}>;

export function Metric({ label, value, danger = false }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: "8px 12px",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: danger ? "#fff1f2" : "#f8fafc",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: danger ? "#be123c" : "#0f172a",
        }}
      >
        {value}
      </span>
    </div>
  );
}
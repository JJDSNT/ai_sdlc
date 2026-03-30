// apps/web/features/execution/components/side-card.tsx

type Props = Readonly<{
  title: string;
  description: string;
}>;

export function SideCard({ title, description }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 16,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
        {title}
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.65, color: "#475569" }}>
        {description}
      </div>
    </div>
  );
}
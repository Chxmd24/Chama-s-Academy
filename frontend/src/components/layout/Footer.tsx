export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#070D18",
        borderTop: "1px solid var(--color-border-navy)",
        marginTop: "auto",
        padding: "var(--space-8) 0 var(--space-6) 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            paddingBottom: "var(--space-6)",
            borderBottom: "1px solid rgba(30, 45, 74, 0.6)",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "var(--font-size-base)",
                fontWeight: 700,
                color: "var(--color-text-white)",
              }}
            >
              Chama&apos;s <span style={{ color: "var(--color-gold)" }}>Academy</span>
            </h4>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              Where Champions Train &amp; Play &bull; Indoor Cricket &amp; Football Stadium Management
            </p>
          </div>

          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-muted)",
            }}
          >
            Built with Spring Boot 4.1.1 &amp; React 18 + Vite 6
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
            marginTop: "var(--space-6)",
          }}
        >
          <div>&copy; 2026 Chama&apos;s Academy. All rights reserved.</div>
          <div>React 18 &bull; TypeScript 5.6 &bull; Pure CSS</div>
        </div>
      </div>
    </footer>
  );
}

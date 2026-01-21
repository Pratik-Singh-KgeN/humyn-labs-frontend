import Button from "@humyn/ui/Button";
import Badge from "@humyn/ui/Badge";

export default function HomePage() {
  return (
    <main
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>🚀 __APP_NAME__</h1>
      <Button>Shared Button</Button>
      <Badge>Shared Badge</Badge>
      <p>Next.js App Router is working.</p>
    </main>
  );
}

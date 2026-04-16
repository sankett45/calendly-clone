import Sidebar from "./Sidebar";
import TopBar  from "./TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      backgroundColor: "#fff", fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", backgroundColor: "#f9fafb" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
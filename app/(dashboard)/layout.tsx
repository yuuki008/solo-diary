export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-screen-lg mx-auto p-8">{children}</div>;
}

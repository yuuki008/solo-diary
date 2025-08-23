export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-lg mx-auto">{children}</div>;
}

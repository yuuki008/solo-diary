export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-screen-lg mx-auto w-[95%]">{children}</div>;
}

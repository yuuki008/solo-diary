export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center h-screen max-w-screen-md mx-auto">
      {children}
    </div>
  );
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
            {children}
        </div>
    );
}

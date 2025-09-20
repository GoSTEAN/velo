import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
            <text
              x="50"
              y="100"
              font-family="Arial"
              font-size="20"
              font-weight="bold"
              fill="#255ff1"
              text-anchor="middle"
            >
              VELO
            </text>
          </svg>

          {/* Navigation Links */}
          <div className="hidden md:flex  items-center gap-15">
            <div className="ml-10 flex text-muted-foreground text-custom-sm space-x-8">
              <Link
                href="#features"
                className="text-gray-text hover:text-foreground transition-colors font-inter font-medium"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-text hover:text-foreground transition-colors font-inter font-medium"
              >
                How It Works
              </Link>
              <Link
                href="#privacy"
                className="text-gray-text hover:text-foreground transition-colors font-inter font-medium"
              >
                Privacy
              </Link>
              <Link
                href="#faq"
                className="text-gray-text hover:text-foreground transition-colors font-inter font-medium"
              >
                FAQ
              </Link>
            </div>
            <div>
              <Button
                onClick={handleGetStarted}
                className="font-semibold"
                size="md"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* CTA Button */}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-gray-text hover:text-foreground"
              title="Open mobile menu"
              aria-label="Open mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

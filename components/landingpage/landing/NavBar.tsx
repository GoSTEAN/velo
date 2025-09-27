import Button from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

const Navbar = () => {


  return (
    <nav className="sticky top-0 z-50 bg-background backdrop-blur-md border-b border-border  shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
         <Link
                href={"/"}
                className="text-5xl font-bold font-[mono] italic rounded-b-2xl border-b-4 text-[#255ff1] "
              >
                VELO
              </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex justify-center  items-center gap-15">
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
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href={"/dashboard"} className="">
            <Button size="md">Get Started</Button>
          </Link>
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

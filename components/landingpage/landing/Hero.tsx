import Button from "@/components/ui/Button";
import { Paprika } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const paprika = Paprika({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-paprika",
});

const Hero = () => {

  return (
    <section className={`relative font-sans`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center px-5 py-3 rounded-full bg-background">
            <span className="bg-background text-muted-foreground text-sm font-medium font-inter flex items-center ">
              Powerful APIs for everything
            </span>
          </div>

          {/* Hero Headline */}
          <div className="w-full lg:max-w-3/4 mx-auto">
            <h1 className=" tracking-tight leading-10 text-muted-foreground ">
              <span
                className={`${paprika.className} hero-title-blue text-head text-custom-5xl `}
              >
                Simplifying
              </span>{" "}
              <span className="font-roboto hero-title-black font-medium text-custom-5xl">
                Crypto Payments for
              </span>
              <span
                className={`${paprika.className} hero-title-blue text-head text-custom-5xl`}
              >
                Nigerian Businesses
              </span>
            </h1>

            <p className="text-custom-md text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Velo offers a seamless crypto payment solution tailored for
              Nigerian businesses. Accept crypto payments effortlessly and
              withdraw in Naira with ease.
            </p>
          </div>

          {/* CTA Button */}
          <Link href={"/dashboard"} className="pt-6">
            <Button size="md">Get Started</Button>
          </Link>
        </div>

        <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden mt-10 ">
          <div className="relative bg-background  p-3">
            <Image
              src="/dashboardlightmode.png"
              alt="Velo Dashboard Preview"
              width={1200}
              height={800}
              className="w-full h-auto rounded-xl "
              priority
            />
          </div>
          <div
            className="w-full h-30 bg-gradient-to-b from-white/20 to-white/90 absolute bottom-0 "
          ></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

"use client";

import Hero from "@/components/landingpage/landing/Hero";
import Features from "@/components/landingpage/landing/Features";
import HowItWorks from "@/components/landingpage/landing/HowItWorks";
import ValueProposition from "@/components/landingpage/landing/ValueProposition";
import FAQ from "@/components/landingpage/landing/FAQ";
import Footer from "@/components/landingpage/landing/Footer";
import Navbar from "@/components/landingpage/landing/NavBar";

export default function Home() {

  return(
    <div className="w-full min-h-screen  bg-background ">
      <Navbar />
    <div className="md:px-25 px-6 mt-20 flex flex-col gap-20 h-full">
      <Hero />
      <Features />
      <HowItWorks />
      <ValueProposition />
      <FAQ />
    </div>
      <Footer />
    </div>
  )
}

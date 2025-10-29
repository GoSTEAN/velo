import { HowItWorks } from "@/components/landingpage/landing/how-it-works";
import { DashboardPreview } from "@/components/landingpage/landing/dashboard-preview";
import { Features } from "@/components/landingpage/landing/features";
import { Hero } from "@/components/landingpage/landing/hero";
import { Navigation } from "@/components/landingpage/landing/navigation";
import { Trust } from "@/components/landingpage/landing/trust";
import { ValueProposition } from "@/components/landingpage/landing/ValueProposition";
// stats-landing removed from homepage per request
import { FAQ } from "@/components/landingpage/landing/FAQ";
import { CTA } from "@/components/landingpage/landing/cta";
import Footer from "@/components/landingpage/landing/Footer";
// Statistic removed from homepage per request

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <Hero />
            <Trust />
            <Features />
            <DashboardPreview />
            <HowItWorks />
            <ValueProposition />
            <FAQ/>
            <CTA />
            <Footer />
        </div>
    )
}

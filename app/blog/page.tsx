import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/buttons"

export const metadata: Metadata = {
    title: "Blog | VELO",
    description: "Latest news, updates, and fintech insights from VELO",
}

const blogPosts = [
    {
        id: 1,
        title: "The Future of Digital Payments in 2025",
        excerpt: "Explore the emerging trends shaping the future of digital payments and how VELO is leading the charge.",
        author: "Sarah Johnson",
        date: "Jan 15, 2025",
        readTime: "5 min read",
        category: "Industry Insights",
        image: "/digital-payments-futuristic.jpg",
    },
    {
        id: 2,
        title: "How to Optimize Your Payment Processing",
        excerpt: "Learn best practices for reducing transaction costs and improving payment success rates.",
        author: "Michael Chen",
        date: "Jan 10, 2025",
        readTime: "7 min read",
        category: "Best Practices",
        image: "/payment-processing-optimization.jpg",
    },
    {
        id: 3,
        title: "VELO API v2.0 Release Notes",
        excerpt: "Discover the new features and improvements in our latest API release.",
        author: "Dev Team",
        date: "Jan 5, 2025",
        readTime: "4 min read",
        category: "Product Updates",
        image: "/api-development-code.png",
    },
    {
        id: 4,
        title: "Security Best Practices for Fintech",
        excerpt: "Essential security measures every fintech company should implement to protect customer data.",
        author: "Alex Rivera",
        date: "Dec 28, 2024",
        readTime: "6 min read",
        category: "Security",
        image: "/cybersecurity-fintech.jpg",
    },
    {
        id: 5,
        title: "Case Study: How Acme Corp Saved 40% on Fees",
        excerpt: "Real-world success story of how one company transformed their payment infrastructure with VELO.",
        author: "Sarah Johnson",
        date: "Dec 20, 2024",
        readTime: "8 min read",
        category: "Case Studies",
        image: "/business-success-growth.jpg",
    },
    {
        id: 6,
        title: "Understanding Virtual Card Technology",
        excerpt: "A deep dive into how virtual cards work and why they're revolutionizing online payments.",
        author: "Michael Chen",
        date: "Dec 15, 2024",
        readTime: "5 min read",
        category: "Technology",
        image: "/virtual-credit-card.jpg",
    },
]

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background">

            <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 velo-gradient opacity-5" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                            VELO <span className="velo-text-gradient">Blog</span>
                        </h1>
                        <p className="text-xl text-muted-foreground text-balance">
                            Latest news, updates, and insights from the world of fintech
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {blogPosts.map((post) => (
                            <article
                                key={post.id}
                                className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={post.image ?? "https://placehold.co/600x400"}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />

                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium rounded-full">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-3 group-hover:velo-text-gradient transition-all line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>{post.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{post.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                    <Button variant="link" className="mt-4 p-0 h-auto velo-text-gradient font-semibold">
                                        Read More →
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="velo-gradient rounded-2xl p-12 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
                        <p className="text-lg mb-8 opacity-90">
                            Subscribe to our newsletter for the latest fintech insights and VELO updates
                        </p>
                        <div className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-8">Subscribe</Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

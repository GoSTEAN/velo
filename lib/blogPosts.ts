export type BlogPost = {
    id: number
    title: string
    excerpt: string
    author: string
    date: string
    readTime: string
    category: string
    image?: string
}

export const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: "VELO: Payments Reimagined",
        excerpt: "How VELO makes payments instant, simple and accessible — a new approach that blends Web2 UX with Web3 settlement.",
        author: "VELO Team",
        date: "Sep 20, 2025",
        readTime: "6 min read",
        category: "Industry Insights",
        image: "/velo-og.png",
    },
    {
        id: 2,
        title: "How to Optimize Your Payment Processing",
        excerpt: "Learn best practices for reducing transaction costs and improving payment success rates.",
        author: "Michael Chen",
        date: "Jan 10, 2025",
        readTime: "7 min read",
        category: "Best Practices",
        image: "/optimizepay.png",
    },
    // posts 3-6 removed
    {
        id: 7,
        title: "VELO Launch — 27 September",
        excerpt: "We launched VELO on 27 September — here's what that means for our product roadmap, partners, and early customers.",
        author: "The VELO Team",
        date: "Sep 27, 2025",
        readTime: "4 min read",
        category: "Company",
        image: "/velo-first-blog.svg",
    },
    {
        id: 8,
        title: "Integrating Stellar with VELO",
        excerpt: "A practical guide to why we chose Stellar for fast, low-cost payments and how teams can integrate Stellar-based rails with VELO.",
        author: "Engineering",
        date: "Oct 10, 2025",
        readTime: "7 min read",
        category: "Integrations",
        image: "/stellar.svg",
    },
    {
        id: 9,
        title: "Polkadot Support: Design & Implementation",
        excerpt: "How we implemented Polkadot support at VELO — architecture, XCMP considerations, and examples using polkadot-js.",
        author: "Blockchain Team",
        date: "Oct 20, 2025",
        readTime: "9 min read",
        category: "Engineering",
        image: "/polkadot.svg",
    },
]

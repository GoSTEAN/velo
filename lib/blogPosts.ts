import slugify from "slugify";

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image?: string;
};

const rawPosts = [
  {
    id: 1,
    title: "VELO: Payments Reimagined",
    content:
      "How VELO makes payments instant, simple and accessible — a new approach that blends Web2 UX with Web3 settlement.",
    author: "VELO Team",
    date: "Sep 20, 2025",
    readTime: "6 min read",
    category: "Industry Insights",
    image: "/velo-og.png",
  },
  {
    id: 2,
    title: "How to Optimize Your Payment Processing",
    content:
      "Learn best practices for reducing transaction costs and improving payment success rates.",
    author: "Michael Chen",
    date: "Jan 10, 2025",
    readTime: "7 min read",
    category: "Best Practices",
    image: "/optimizepay.png",
  },
];

export const blogPosts: BlogPost[] = rawPosts.map((post) => ({
  ...post,
  slug: slugify(post.title, { lower: true, strict: true }),
}));

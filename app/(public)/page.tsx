import Hero from "@/components/landing/Hero";
import FeaturedPosts from "@/components/landing/FeaturedPosts";
import CommunityCTA from "@/components/landing/CommunityCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedPosts />
      <CommunityCTA />
      <Footer />
    </>
  );
}

import HeroSection from "../components/home/HeroSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Categories from "../components/home/Categories";
import Manifesto from "../components/home/Manifesto";
import Newsletter from "../components/home/Newsletter";

export default function Home() {
    return (
        <>
            <HeroSection />
            <FeaturedProducts />
            <Manifesto />
            <Categories />
            <Newsletter />
        </>
    );
}

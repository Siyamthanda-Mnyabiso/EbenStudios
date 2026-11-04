import ProductCard from "./ProductCard";
import Reveal from "../ui/Reveal";

export default function ProductGrid({ products }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {products.map((product, index) => (
                <Reveal key={product.id} delay={(index % 4) * 90}>
                    <ProductCard product={product} />
                </Reveal>
            ))}
        </div>
    );
}

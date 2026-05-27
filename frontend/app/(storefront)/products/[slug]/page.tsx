import { ProductDetail } from '@/components/products/ProductDetail';

interface PageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: PageProps) {
  return <ProductDetail slug={params.slug} />;
}

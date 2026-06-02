import { notFound } from 'next/navigation';
import { productsApi } from '../../../../lib/api/products';
import { ProductDetail } from '../../../../components/products/ProductDetail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productsApi.getBySlug(slug);
    return {
      title: product.name,
      description: product.description?.slice(0, 160),
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  try {
    const product = await productsApi.getBySlug(slug);
    return <ProductDetail product={product} />;
  } catch {
    notFound();
  }
}

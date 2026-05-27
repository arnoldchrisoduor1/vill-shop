import type { FeatureFlag } from '@/types/feature';
import type { Cart, CartItem } from '@/types/cart';
import type { Order, OrderItem } from '@/types/order';
import type { Product, ProductFilters, ProductImage } from '@/types/product';
import type { CheckoutFormData } from '@/validators';

const NEW_PRODUCT_DAYS = 30;

function fromCents(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number' && value > 1000) return value / 100;
  return Number(value);
}

export function normalizeImages(images: unknown): ProductImage[] {
  if (!Array.isArray(images)) return [];
  return images.map((img, index) =>
    typeof img === 'string'
      ? { id: index, url: img, is_primary: index === 0 }
      : (img as ProductImage),
  );
}

export function normalizeProduct(raw: Record<string, unknown>): Product {
  const category = raw.category;
  const price = Number(raw.price ?? 0);
  const compareAtPrice = fromCents(raw.compare_at_price ?? raw.compare_at_price_kes);
  const createdAt = raw.created_at as string | undefined;
  const isNew = createdAt
    ? Date.now() - new Date(createdAt).getTime() < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000
    : false;

  return {
    id: raw.id as number,
    name: raw.name as string,
    slug: raw.slug as string,
    description: (raw.description as string) ?? '',
    short_description: raw.short_description as string | undefined,
    price,
    compare_at_price: compareAtPrice,
    sku: (raw.sku as string) ?? '',
    stock: (raw.stock as number) ?? 0,
    category:
      typeof category === 'string'
        ? category
        : category && typeof category === 'object' && 'name' in category
          ? String((category as { name: string }).name)
          : '',
    is_featured: Boolean(raw.is_featured),
    is_active: raw.is_active !== false,
    is_new: isNew,
    is_on_sale: compareAtPrice !== undefined && compareAtPrice > price,
    images: normalizeImages(raw.images),
    average_rating: raw.average_rating as number | undefined,
    review_count: raw.review_count as number | undefined,
    created_at: createdAt ?? '',
    updated_at: (raw.updated_at as string) ?? '',
  };
}

export function normalizeCartItem(raw: Record<string, unknown>): CartItem {
  const product = raw.product
    ? normalizeProduct(raw.product as Record<string, unknown>)
    : undefined;

  return {
    id: raw.id as number,
    product_id: raw.product_id as number,
    product: product as CartItem['product'],
    quantity: raw.quantity as number,
    unit_price: fromCents(raw.unit_price ?? raw.unit_price_kes) ?? product?.price ?? 0,
    total_price: fromCents(raw.line_total_kes ?? raw.total_price) ?? 0,
  };
}

export function normalizeCart(raw: Record<string, unknown>): Cart {
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => normalizeCartItem(item as Record<string, unknown>))
    : [];

  return {
    id: raw.id as number,
    items,
    subtotal: Number(raw.subtotal ?? fromCents(raw.subtotal_kes) ?? 0),
    item_count: Number(raw.item_count ?? items.reduce((sum, i) => sum + i.quantity, 0)),
  };
}

export function normalizeOrderItem(raw: Record<string, unknown>): OrderItem {
  return {
    id: raw.id as number,
    product_id: raw.product_id as number,
    product_name: raw.product_name as string | undefined,
    product: raw.product_name
      ? normalizeProduct({
          id: raw.product_id,
          name: raw.product_name,
          slug: '',
          description: '',
          price: fromCents(raw.unit_price_kes) ?? 0,
          sku: raw.sku ?? '',
          stock: 0,
          is_featured: false,
          is_active: true,
          is_new: false,
          is_on_sale: false,
          images: [],
          created_at: '',
          updated_at: '',
        })
      : undefined,
    quantity: raw.quantity as number,
    unit_price: fromCents(raw.unit_price ?? raw.unit_price_kes) ?? 0,
    total_price: fromCents(raw.total_kes ?? raw.total_price) ?? 0,
    total: fromCents(raw.total_kes ?? raw.total_price) ?? 0,
    is_digital: Boolean(raw.is_digital),
  };
}

export function normalizeOrder(raw: Record<string, unknown>): Order {
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => normalizeOrderItem(item as Record<string, unknown>))
    : [];

  return {
    id: raw.id as number,
    order_number: raw.order_number as string,
    user_id: raw.user_id as number | undefined,
    status: String(raw.status ?? 'pending').toLowerCase() as Order['status'],
    items,
    subtotal: Number(raw.subtotal ?? fromCents(raw.subtotal_kes) ?? 0),
    tax_amount: Number(raw.tax_amount ?? fromCents(raw.tax_amount_kes) ?? 0),
    total: Number(raw.total ?? fromCents(raw.total_kes) ?? 0),
    currency: (raw.currency as string) ?? 'KES',
    customer_email: raw.customer_email as string | undefined,
    customer_name: raw.customer_name as string | undefined,
    customer_phone: raw.customer_phone as string | undefined,
    created_at: (raw.created_at as string) ?? '',
  };
}

export function normalizeFeatureFlags(data: unknown): FeatureFlag[] {
  const toValue = (value: unknown): FeatureFlag['value'] => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    return undefined;
  };

  if (Array.isArray(data)) {
    return data.map((flag) => ({
      key: String(flag.key),
      name: String(flag.key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: flag.description as string | undefined,
      enabled: Boolean(flag.enabled),
      value: toValue(flag.payload ?? flag.value),
    }));
  }

  if (data && typeof data === 'object') {
    return Object.entries(data as Record<string, { enabled?: boolean; payload?: unknown }>).map(
      ([key, flag]) => ({
        key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        enabled: Boolean(flag.enabled),
        value: toValue(flag.payload),
      }),
    );
  }

  return [];
}

export function mapProductFilters(filters?: ProductFilters): Record<string, string | number | boolean | undefined> {
  if (!filters) return {};

  const params: Record<string, string | number | boolean | undefined> = {
    search: filters.search,
    page: filters.page,
    per_page: filters.per_page,
  };

  if (filters.category) params.category_slug = filters.category;
  if (filters.is_featured) params.featured = true;
  if (filters.min_price !== undefined) params.min_price = Math.round(filters.min_price * 100);
  if (filters.max_price !== undefined) params.max_price = Math.round(filters.max_price * 100);

  switch (filters.sort) {
    case 'name':
      params.sort = 'name';
      params.direction = 'asc';
      break;
    case 'price_asc':
      params.sort = 'price_kes';
      params.direction = 'asc';
      break;
    case 'price_desc':
      params.sort = 'price_kes';
      params.direction = 'desc';
      break;
    case 'newest':
      params.sort = 'created_at';
      params.direction = 'desc';
      break;
    default:
      break;
  }

  return params;
}

export function mapCheckoutPayload(data: CheckoutFormData) {
  const country =
    data.country.length === 2 ? data.country.toUpperCase() : data.country === 'Kenya' ? 'KE' : 'KE';

  return {
    email: data.email,
    name: `${data.first_name} ${data.last_name}`.trim(),
    phone: data.phone,
    shipping_address_line1: data.address_line1,
    shipping_address_line2: data.address_line2,
    shipping_city: data.city,
    shipping_country: country,
    notes: data.notes,
  };
}

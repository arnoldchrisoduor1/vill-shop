import { EventDetail } from '@/components/events/EventDetail';

interface PageProps {
  params: { slug: string };
}

export default function EventPage({ params }: PageProps) {
  return <EventDetail slug={params.slug} />;
}

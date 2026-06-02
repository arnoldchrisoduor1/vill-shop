'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Props {
  currentMin?: string;
  currentMax?: string;
}

export function ProductsPriceFilter({ currentMin, currentMax }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(currentMin ?? '');
  const [max, setMax] = useState(currentMax ?? '');

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');
    router.push(`/products?${params.toString()}`);
  };

  const clear = () => {
    setMin('');
    setMax('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Price Range (KES)</h3>
      <div className="flex gap-2 mb-2">
        <Input
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="text-sm"
        />
        <Input
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={apply}>Apply</Button>
        {(currentMin || currentMax) && (
          <Button size="sm" variant="outline" onClick={clear}>Clear</Button>
        )}
      </div>
    </div>
  );
}

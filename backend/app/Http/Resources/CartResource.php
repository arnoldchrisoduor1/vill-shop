<?php

namespace App\Http\Resources;

use App\Helpers\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items');
        $subtotal = $this->relationLoaded('items')
            ? $this->items->sum(fn ($i) => Money::multiply($i->unit_price_kes, $i->quantity))
            : 0;

        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($items),
            'subtotal_kes' => $subtotal,
            'subtotal' => Money::fromCents($subtotal),
            'item_count' => $this->relationLoaded('items') ? $this->items->sum('quantity') : 0,
        ];
    }
}

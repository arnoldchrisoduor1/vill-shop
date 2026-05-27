<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'sku' => $this->sku,
            'quantity' => $this->quantity,
            'unit_price_kes' => $this->unit_price_kes,
            'total_kes' => $this->total_kes,
            'is_digital' => $this->whenLoaded('product', fn () => ($this->product?->type ?? 'physical') === 'digital', false),
        ];
    }
}

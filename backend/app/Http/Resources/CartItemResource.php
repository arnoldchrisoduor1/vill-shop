<?php

namespace App\Http\Resources;

use App\Helpers\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_variant_id' => $this->product_variant_id,
            'quantity' => $this->quantity,
            'unit_price_kes' => $this->unit_price_kes,
            'line_total_kes' => Money::multiply($this->unit_price_kes, $this->quantity),
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}

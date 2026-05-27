<?php

namespace App\Http\Resources;

use App\Helpers\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'price_kes' => $this->price_kes,
            'price' => Money::fromCents($this->price_kes),
            'stock' => $this->stock,
            'attributes' => $this->attributes,
            'is_active' => $this->is_active,
        ];
    }
}

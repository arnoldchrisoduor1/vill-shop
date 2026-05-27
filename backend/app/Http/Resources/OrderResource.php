<?php

namespace App\Http\Resources;

use App\Helpers\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status->label(),
            'subtotal_kes' => $this->subtotal_kes,
            'tax_amount_kes' => $this->tax_amount_kes,
            'total_kes' => $this->total_kes,
            'subtotal' => Money::fromCents($this->subtotal_kes),
            'tax_amount' => Money::fromCents($this->tax_amount_kes),
            'total' => Money::fromCents($this->total_kes),
            'currency' => $this->currency,
            'customer_email' => $this->customer_email,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'shipping_address_line1' => $this->shipping_address_line1,
            'shipping_address_line2' => $this->shipping_address_line2,
            'shipping_city' => $this->shipping_city,
            'shipping_country' => $this->shipping_country,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

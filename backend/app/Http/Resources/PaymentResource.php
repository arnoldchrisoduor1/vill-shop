<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'external_id' => $this->external_id,
            'status' => $this->status,
            'amount_kes' => $this->amount_kes,
            'currency' => $this->currency,
            'paid_at' => $this->paid_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Services;

use App\Helpers\Money;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentService
{
    public function initiatePayment(Order $order): array
    {
        $payment = Payment::create([
            'order_id' => $order->id,
            'provider' => 'pesapal',
            'status' => 'pending',
            'amount_kes' => $order->total_kes,
            'currency' => $order->currency,
            'external_id' => 'PES-'.Str::uuid(),
        ]);

        $sandboxUrl = config('services.pesapal.sandbox_url');
        $callbackUrl = config('services.pesapal.callback_url');
        $redirectUrl = config('services.pesapal.redirect_url');

        $checkoutUrl = rtrim($sandboxUrl, '/').'/api/Transactions/SubmitOrderRequest';

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->post($checkoutUrl, [
            'id' => $payment->external_id,
            'currency' => $order->currency,
            'amount' => Money::fromCents($order->total_kes),
            'description' => "Order {$order->order_number}",
            'callback_url' => $callbackUrl,
            'redirect_url' => $redirectUrl,
            'billing_address' => [
                'email_address' => $order->customer_email,
                'phone_number' => $order->customer_phone,
                'country_code' => $order->shipping_country,
            ],
        ]);

        $payment->update([
            'metadata' => [
                'init_response' => $response->json(),
                'checkout_url' => $response->json('redirect_url') ?? rtrim($sandboxUrl, '/')."/checkout/{$payment->external_id}",
            ],
        ]);

        return [
            'payment_id' => $payment->id,
            'external_id' => $payment->external_id,
            'checkout_url' => $payment->metadata['checkout_url'] ?? null,
        ];
    }

    public function verifySignature(array $payload, ?string $signature): bool
    {
        $secret = config('services.pesapal.consumer_secret');

        if (! $secret || ! $signature) {
            return app()->environment('local', 'testing');
        }

        $computed = hash_hmac('sha256', json_encode($payload), $secret);

        return hash_equals($computed, $signature);
    }

    public function markPaymentCompleted(Payment $payment, array $metadata = []): Payment
    {
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'metadata' => array_merge($payment->metadata ?? [], $metadata),
        ]);

        return $payment->fresh();
    }
}

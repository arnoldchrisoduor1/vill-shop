<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Payment;
use App\Models\WebhookLog;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessPesapalWebhook implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public int $webhookLogId,
        public ?string $signature = null,
    ) {}

    public function handle(PaymentService $payments, OrderService $orders): void
    {
        $log = WebhookLog::findOrFail($this->webhookLogId);
        $payload = $log->payload;

        try {
            if (! $payments->verifySignature($payload, $this->signature)) {
                throw new \RuntimeException('Invalid webhook signature');
            }

            $externalId = $payload['OrderTrackingId'] ?? $payload['order_tracking_id'] ?? null;
            $status = strtoupper($payload['status'] ?? $payload['payment_status'] ?? '');

            if (! $externalId) {
                throw new \RuntimeException('Missing order tracking ID');
            }

            $payment = Payment::where('external_id', $externalId)->first();

            if (! $payment) {
                throw new \RuntimeException("Payment not found for {$externalId}");
            }

            $order = Order::with('payment')->findOrFail($payment->order_id);

            if ($order->paid_at) {
                $log->update(['status' => 'skipped', 'processed_at' => now(), 'error_message' => 'Already paid']);

                return;
            }

            if (in_array($status, ['COMPLETED', 'PAID', 'SUCCESS'], true)) {
                $payments->markPaymentCompleted($payment, ['webhook' => $payload]);
                $orders->markPaid($order);
                $log->update(['status' => 'processed', 'processed_at' => now()]);
            } else {
                $log->update(['status' => 'ignored', 'processed_at' => now(), 'error_message' => "Status: {$status}"]);
            }
        } catch (\Throwable $e) {
            Log::error('pesapal.webhook.failed', [
                'webhook_log_id' => $this->webhookLogId,
                'error' => $e->getMessage(),
            ]);

            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'processed_at' => now(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        WebhookLog::where('id', $this->webhookLogId)->update([
            'status' => 'failed_permanently',
            'error_message' => $exception->getMessage(),
            'processed_at' => now(),
        ]);
    }
}

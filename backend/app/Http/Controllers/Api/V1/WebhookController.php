<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessPesapalWebhook;
use App\Models\WebhookLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function pesapal(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $request->header('X-Pesapal-Signature');

        $log = WebhookLog::create([
            'provider' => 'pesapal',
            'event_type' => $payload['status'] ?? $payload['event'] ?? 'unknown',
            'external_id' => $payload['OrderTrackingId'] ?? $payload['order_tracking_id'] ?? null,
            'payload' => $payload,
            'status' => 'received',
        ]);

        ProcessPesapalWebhook::dispatch($log->id, $signature);

        return ApiResponse::success(['log_id' => $log->id], 'Webhook received', 202);
    }
}

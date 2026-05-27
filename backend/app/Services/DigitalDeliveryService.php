<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Storage;

class DigitalDeliveryService
{
    public function generateDownloadUrl(Order $order, OrderItem $item, int $userId): string
    {
        if ($order->user_id !== $userId) {
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException('Unauthorized');
        }

        $product = $item->product;

        if (! $product) {
            throw new \InvalidArgumentException('Product not found');
        }

        $isDigital = ($product->type ?? 'physical') === 'digital';

        if (! $isDigital) {
            throw new \InvalidArgumentException('This item is not a digital product');
        }

        if (! $order->paid_at) {
            throw new \InvalidArgumentException('Order has not been paid');
        }

        $media = $product->getFirstMedia('digital');

        if (! $media) {
            throw new \InvalidArgumentException('Digital file not available');
        }

        return $media->getTemporaryUrl(now()->addHours(24));
    }
}

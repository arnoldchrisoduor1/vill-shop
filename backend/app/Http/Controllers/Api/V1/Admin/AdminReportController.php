<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\OrderRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportController extends Controller
{
    public function __construct(private OrderRepository $orders) {}

    public function ordersCsv(Request $request): StreamedResponse
    {
        $orders = $this->orders->forReport(
            $request->get('from'),
            $request->get('to')
        );

        return response()->streamDownload(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['order_number', 'status', 'customer_email', 'subtotal_kes', 'tax_amount_kes', 'total_kes', 'created_at']);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->order_number,
                    $order->status->label(),
                    $order->customer_email,
                    $order->subtotal_kes,
                    $order->tax_amount_kes,
                    $order->total_kes,
                    $order->created_at->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 'orders-report.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}

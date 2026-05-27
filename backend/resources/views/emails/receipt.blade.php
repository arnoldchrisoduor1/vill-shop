<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Receipt</title>
</head>
<body>
    <h1>Thank you for your order!</h1>
    <p>Order: <strong>{{ $order->order_number }}</strong></p>
    <p>Customer: {{ $order->customer_name }}</p>

    <table border="1" cellpadding="8" cellspacing="0">
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price (KES)</th>
                <th>Total (KES)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format(\App\Helpers\Money::fromCents($item->unit_price_kes), 2) }}</td>
                    <td>{{ number_format(\App\Helpers\Money::fromCents($item->total_kes), 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p>Subtotal: KES {{ number_format(\App\Helpers\Money::fromCents($order->subtotal_kes), 2) }}</p>
    <p>Tax: KES {{ number_format(\App\Helpers\Money::fromCents($order->tax_amount_kes), 2) }}</p>
    <p><strong>Total: KES {{ number_format(\App\Helpers\Money::fromCents($order->total_kes), 2) }}</strong></p>
</body>
</html>

<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Shipped</title></head>
<body>
    <h1>Your order is on the way!</h1>
    <p>Order <strong>{{ $order->order_number }}</strong> has been shipped.</p>
    <p>Shipping to: {{ $order->shipping_address_line1 }}, {{ $order->shipping_city }}</p>
</body>
</html>

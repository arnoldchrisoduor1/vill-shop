<?php

use App\Models\FeatureFlag;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

test('health endpoint returns ok', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['status', 'database', 'timestamp']]);
});

test('features endpoint returns feature flags', function () {
    FeatureFlag::create([
        'key' => 'tax',
        'enabled' => true,
        'payload' => ['rate' => 16],
    ]);

    $response = $this->getJson('/api/v1/features');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.tax.enabled', true);
});

test('user can register and login', function () {
    $register = $this->postJson('/api/v1/auth/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $register->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['user', 'token']]);

    $login = $this->postJson('/api/v1/auth/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $login->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['user', 'token']]);
});

test('authenticated user can access profile', function () {
    $user = User::factory()->create();
    $token = JWTAuth::fromUser($user);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/profile');

    $response->assertOk()
        ->assertJsonPath('data.email', $user->email);
});

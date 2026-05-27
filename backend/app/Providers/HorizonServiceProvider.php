<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    public function boot(): void
    {
        parent::boot();

        Horizon::auth(function ($request) {
            return app()->environment('local')
                || ($request->user()?->role?->isAdmin() ?? false);
        });
    }

    protected function gate(): void
    {
        Gate::define('viewHorizon', function ($user) {
            return $user->role?->isAdmin() ?? false;
        });
    }
}

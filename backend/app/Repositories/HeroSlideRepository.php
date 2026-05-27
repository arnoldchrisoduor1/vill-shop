<?php

namespace App\Repositories;

use App\Models\HeroSlide;
use Illuminate\Database\Eloquent\Collection;

class HeroSlideRepository
{
    public function active(): Collection
    {
        return HeroSlide::where('is_active', true)->orderBy('sort_order')->get();
    }

    public function all(): Collection
    {
        return HeroSlide::orderBy('sort_order')->get();
    }

    public function create(array $data): HeroSlide
    {
        return HeroSlide::create($data);
    }

    public function update(HeroSlide $slide, array $data): HeroSlide
    {
        $slide->update($data);

        return $slide->fresh();
    }

    public function delete(HeroSlide $slide): void
    {
        $slide->delete();
    }
}

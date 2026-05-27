<?php

namespace App\Services;

use App\Models\HeroSlide;
use App\Repositories\HeroSlideRepository;
use Illuminate\Database\Eloquent\Collection;

class HeroSlideService
{
    public function __construct(private HeroSlideRepository $slides) {}

    public function active(): Collection
    {
        return $this->slides->active();
    }

    public function all(): Collection
    {
        return $this->slides->all();
    }

    public function create(array $data): HeroSlide
    {
        return $this->slides->create($data);
    }

    public function update(HeroSlide $slide, array $data): HeroSlide
    {
        return $this->slides->update($slide, $data);
    }

    public function delete(HeroSlide $slide): void
    {
        $this->slides->delete($slide);
    }
}

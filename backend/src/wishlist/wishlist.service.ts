import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Wishlist } from '../database/entities/wishlist.entity';
import { Product } from '../database/entities/product.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepo: Repository<Wishlist>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  private async getOrCreateWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepo.findOne({
      where: { userId },
      relations: { products: { media: true } },
    });

    if (!wishlist) {
      wishlist = await this.wishlistRepo.save(
        this.wishlistRepo.create({ userId, products: [] }),
      );
    }

    return wishlist;
  }

  async getWishlist(userId: string): Promise<Wishlist> {
    return this.getOrCreateWishlist(userId);
  }

  async addProduct(userId: string, productId: string): Promise<Wishlist> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const wishlist = await this.getOrCreateWishlist(userId);
    const alreadyAdded = wishlist.products?.some((p) => p.id === productId);

    if (!alreadyAdded) {
      wishlist.products = [...(wishlist.products ?? []), product];
      await this.wishlistRepo.save(wishlist);
    }

    return this.getOrCreateWishlist(userId);
  }

  async removeProduct(userId: string, productId: string): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    wishlist.products = (wishlist.products ?? []).filter((p) => p.id !== productId);
    await this.wishlistRepo.save(wishlist);
    return this.getOrCreateWishlist(userId);
  }

  async syncWishlist(userId: string, productIds: string[]): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const products = productIds.length
      ? await this.productRepo.findBy({ id: In(productIds) })
      : [];
    wishlist.products = products;
    await this.wishlistRepo.save(wishlist);
    return this.getOrCreateWishlist(userId);
  }
}

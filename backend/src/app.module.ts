import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RolesGuard } from './common/guards/roles.guard';

import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { EventsModule } from './events/events.module';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { StatsModule } from './stats/stats.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './health/health.module';

import { User } from './database/entities/user.entity';
import { Category } from './database/entities/category.entity';
import { Tag } from './database/entities/tag.entity';
import { Product } from './database/entities/product.entity';
import { ProductVariant } from './database/entities/product-variant.entity';
import { ProductMedia } from './database/entities/product-media.entity';
import { ShopEvent } from './database/entities/event.entity';
import { HeroSlide } from './database/entities/hero-slide.entity';
import { ExchangeRate } from './database/entities/exchange-rate.entity';
import { FeatureFlag } from './database/entities/feature-flag.entity';
import { NewsletterSubscriber } from './database/entities/newsletter-subscriber.entity';
import { Cart } from './database/entities/cart.entity';
import { CartItem } from './database/entities/cart-item.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { Payment } from './database/entities/payment.entity';
import { Review } from './database/entities/review.entity';
import { Wishlist } from './database/entities/wishlist.entity';
import { WebhookLog } from './database/entities/webhook-log.entity';
import { redisConfig } from './config/redis.config';

const ENTITIES = [
  User,
  Category,
  Tag,
  Product,
  ProductVariant,
  ProductMedia,
  ShopEvent,
  HeroSlide,
  ExchangeRate,
  FeatureFlag,
  NewsletterSubscriber,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Review,
  Wishlist,
  WebhookLog,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'villshop',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'villshop',
        entities: ENTITIES,
        migrations: [__dirname + '/database/migrations/*.{ts,js}'],
        synchronize: false,
        logging: false,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRoot({ redis: redisConfig }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CacheModule.register({ isGlobal: true, ttl: 3600 }),
    AuthModule,
    MailModule,
    StorageModule,
    ProductsModule,
    CategoriesModule,
    TagsModule,
    EventsModule,
    HeroSlidesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    UsersModule,
    ReviewsModule,
    WishlistModule,
    FeatureFlagsModule,
    NewsletterModule,
    StatsModule,
    InventoryModule,
    ReportsModule,
    JobsModule,
    HealthModule,
  ],
  providers: [RolesGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

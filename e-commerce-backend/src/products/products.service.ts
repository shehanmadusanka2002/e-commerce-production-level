import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const PRODUCTS_TTL = 300; // 5 minutes

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: { ...createProductDto },
    });
    // Invalidate product list caches
    await this.redis.delPattern('products:*');
    return product;
  }

  async findAll(categoryId?: string, minPrice?: number, maxPrice?: number, search?: string) {
    const cacheKey = `products:list:${categoryId || 'all'}:${minPrice || 0}:${maxPrice || 0}:${search || ''}`;
    
    const cached = await this.redis.get<any[]>(cacheKey);
    if (cached) return cached;

    const data = await this.prisma.product.findMany({
      where: {
        categoryId: categoryId || undefined,
        price: {
          gte: minPrice ? Number(minPrice) : undefined,
          lte: maxPrice ? Number(maxPrice) : undefined,
        },
        OR: search ? [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: { category: true, brand: true },
    });

    await this.redis.set(cacheKey, data, PRODUCTS_TTL);
    return data;
  }

  async findOne(id: string) {
    const cacheKey = `products:id:${id}`;

    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true },
    });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);

    await this.redis.set(cacheKey, product, PRODUCTS_TTL);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { ...updateProductDto },
    });
    // Invalidate both the individual and list caches
    await this.redis.del(`products:id:${id}`);
    await this.redis.delPattern('products:list:*');
    return product;
  }

  async remove(id: string) {
    const product = await this.prisma.product.delete({ where: { id } });
    await this.redis.del(`products:id:${id}`);
    await this.redis.delPattern('products:list:*');
    return product;
  }
}

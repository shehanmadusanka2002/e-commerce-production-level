import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, brand: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return items.map((item) => ({
      id: item.product.id,
      title: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0] || '',
      category: item.product.category?.name || '',
      brand: item.product.brand?.name || '',
      qty: item.quantity,
    }));
  }

  async addItem(userId: string, productId: string, quantity = 1) {
    await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId, productId, quantity },
    });
    return this.getCart(userId);
  }

  async updateQty(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }
    await this.prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
    });
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { userId, productId },
    });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return [];
  }
}

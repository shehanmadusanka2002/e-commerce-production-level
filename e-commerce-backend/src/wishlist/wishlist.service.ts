import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: {
          id: existing.id
        }
      });
      return { status: 'removed' };
    }

    await this.prisma.wishlist.create({
      data: {
        userId,
        productId
      }
    });
    return { status: 'added' };
  }

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return items.map(i => i.product);
  }
}

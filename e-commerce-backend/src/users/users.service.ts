import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async syncUser(id: string, email: string, fullName?: string) {
    return this.prisma.user.upsert({
      where: { id },
      update: { email, fullName },
      create: { id, email, fullName },
    });
  }

  async makeAdmin(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        orders: true, // Include orders so we can calculate total spent
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Delete order items first, then orders, then user
      await tx.orderItem.deleteMany({
        where: { order: { userId: id } },
      });
      await tx.order.deleteMany({
        where: { userId: id },
      });
      return tx.user.delete({
        where: { id },
      });
    });
  }
}

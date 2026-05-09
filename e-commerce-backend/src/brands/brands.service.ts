import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, logo?: string) {
    const existing = await this.prisma.brand.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Brand already exists');

    return this.prisma.brand.create({
      data: { name, logo }
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: true }
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, name?: string, logo?: string) {
    const brand = await this.findOne(id);
    
    if (name && name !== brand.name) {
      const existing = await this.prisma.brand.findUnique({ where: { name } });
      if (existing) throw new ConflictException('Brand name already in use');
    }

    return this.prisma.brand.update({
      where: { id },
      data: { name, logo }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.brand.delete({ where: { id } });
  }
}

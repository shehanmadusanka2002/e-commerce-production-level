import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
      },
    });
  }

  findAll(categoryId?: string, minPrice?: number, maxPrice?: number, search?: string) {
    return this.prisma.product.findMany({
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
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true },
    });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
      },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

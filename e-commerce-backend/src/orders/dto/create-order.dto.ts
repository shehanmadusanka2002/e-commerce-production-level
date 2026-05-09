import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsEnum, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '@prisma/client';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsEnum(PaymentType)
  paymentMethod: PaymentType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

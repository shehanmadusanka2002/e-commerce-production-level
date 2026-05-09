import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post('add')
  addItem(@Request() req, @Body() body: { productId: string; quantity?: number }) {
    return this.cartService.addItem(req.user.sub, body.productId, body.quantity ?? 1);
  }

  @Patch(':productId')
  updateQty(@Request() req, @Param('productId') productId: string, @Body() body: { quantity: number }) {
    return this.cartService.updateQty(req.user.sub, productId, body.quantity);
  }

  @Delete('clear')
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.sub);
  }

  @Delete(':productId')
  removeItem(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.sub, productId);
  }
}

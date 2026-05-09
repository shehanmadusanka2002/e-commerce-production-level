import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.sub);
  }

  @Post('toggle/:productId')
  async toggle(@Param('productId') productId: string, @Request() req) {
    return this.wishlistService.toggle(req.user.sub, productId);
  }
}

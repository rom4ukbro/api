import { Controller, Get, Post, Body, Param, Res, HttpStatus, Delete, Query, HttpCode, Options, Put } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PromoService } from './promo.service';
import { CreateProductDto } from '../../dto/product.dto';
import { searchProductDto } from '@/dto/search-product.dto';
import { SearchResultDto } from '@/dto/search-result.dto';
import { CreatePromoDto } from '@/dto/promo.dto';

@ApiTags('Promo')
@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all Promo Codes',
    type: [CreateProductDto],
  })
  async getProducts(@Res() res) {
    const promoCodes = await this.promoService.getPromoCodes();

    return res.status(HttpStatus.OK).json({ promoCodes: promoCodes });
  }


  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Promo code is created',
    type: CreateProductDto,
  })
  @ApiBody({ type: CreatePromoDto })
  async createPromo(@Body() promoDto: CreatePromoDto) {
    const promoCode =  await this.promoService.create(promoDto);
    return promoCode;
  }

  // @Put('update')
  // @ApiQuery({ name: 'token' })
  // @ApiBody({ type: CreateProductDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Product updated',
  //   type: CreateProductDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Product not found.',
  // })
  // async updateProduct(
  //   @Body() productDto: CreateProductDto,
  //   @Query('token') token: string,
  // ) {
  //   return this.promoService.updateProduct(token, productDto);
  // }

  // @Delete('delete')
  // @ApiQuery({ name: 'token' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Product deleted',
  //   type: CreateProductDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Product not found.',
  // })
  // async deleteProduct(@Query('token') token: string) {
  //   return this.promoService.deleteProduct(token);
  // }

  // @Post('search')
  // @HttpCode(HttpStatus.OK)
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Product created',
  //   type: SearchResultDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Product not found.',
  // })
  // @ApiBody({ type: searchProductDto })
  // @ApiQuery({ name: 'page' })
  // async searchProduct(
  //   @Body() productDto: searchProductDto,
  //   @Query('page') page: string,
  // ) {
  //   return this.promoService.searchProduct(productDto, page);
  // }
}

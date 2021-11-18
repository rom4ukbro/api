import { Request, Response } from 'express';
import { Controller, Get, Post, Body, Param, Res, HttpStatus, Delete, Query, HttpCode, Options, Put, HttpException, UseGuards, Req, UseInterceptors, UploadedFile, UploadedFiles,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';

import { ProductService } from './product.service';
import { CreateProductDto } from '../../dto/product.dto';
import { searchProductDto } from '@/dto/search-product.dto';
import { SearchResultDto } from '@/dto/search-result.dto';
import { UserRoles } from '@/constants/auth';
import { Roles } from '@/decorators/roles.decorator';
import { AuthGuard } from '@/Modules/Auth/auth.guard';
import { TokenService } from '../Tokens/token.service';

import { ProductType } from '@/constants/product';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly tokenService: TokenService,
  ) {}

  // @Roles(UserRoles.AUTHOR, UserRoles.STUDENT, UserRoles.ADMIN)

  // @UseGuards(AuthGuard)
  @Get('/bystore/:store_id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all products',
    type: [CreateProductDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async getProducts(
    @Param('store_id') store_id: string,
    @Res({ passthrough: true }) res,
  ) {
    const userData = this.tokenService.getTokenData();
    const user_id = !!userData ? userData.id : null;
    const products = await this.productService.findByStore(store_id, user_id);
    return { products: products };
  }

  @Get('/byauthor')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user products',
    type: [CreateProductDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async getAuthorProducts(@Res({ passthrough: true }) res) {
    const userData = this.tokenService.getTokenData();
    const user_id = !!userData ? userData.id : null;
    const products = await this.productService.findByAuthorId(user_id);

    return { products: products };
  }

  @Get('bytoken/:token')
  @ApiQuery({ name: 'token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all products',
    type: [CreateProductDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async findByToken(
    @Param('token') product_token: string,
    @Res({ passthrough: true }) res,
  ) {
    const userData = this.tokenService.getTokenData();
    const user_id = !!userData ? userData.id : null;
    const product = await this.productService.findByTokenWithPayment(
      product_token,
      user_id,
    );

    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

    return { product: product };
  }

  @Roles(UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Get('subscribe')
  @ApiQuery({ name: 'stdtoken' })
  @ApiQuery({ name: 'pdtoken' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all products',
    type: CreateProductDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async subscribe(
    @Query('stdtoken') studentToken: string,
    @Query('pdtoken') productToken: string,
  ) {
    return await this.productService.subscribe(studentToken, productToken);
  }

  @Roles(UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Get('addfav')
  @ApiQuery({ name: 'stdtoken' })
  @ApiQuery({ name: 'pdtoken' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all products',
    type: CreateProductDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async addFav(
    @Query('stdtoken') studentToken: string,
    @Query('pdtoken') productToken: string,
  ) {
    return await this.productService.addFav(studentToken, productToken);
  }

  @Roles(UserRoles.AUTHOR, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created',
    type: CreateProductDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found.',
  })
  @ApiBody({ type: CreateProductDto })
  async createProduct(@Body() productDto: CreateProductDto) {
    
    let product;
    const productType = productDto.product_type;

    if (productType == ProductType.EVENT)
        product = await this.productService.createEvent(productDto);
    else
    if (productType == ProductType.COURSE)
        product = await this.productService.createCourse(productDto);
    else
      throw new HttpException('Unsupported product type', HttpStatus.INTERNAL_SERVER_ERROR);
    
    return { product };
  }

  @UseGuards(AuthGuard)
  @Post('update')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated',
    type: CreateProductDto,
  })
  async updateProduct(
    @Body() productDto: any, 
    @Res({passthrough: true}) res: Response) {

    const product = await this.productService.updateProduct(productDto);

    await this.productService.updateUploads(product);

    return {
      success: !!product, 
      // product: product
    };
  }

  @Roles(UserRoles.AUTHOR, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Delete('delete')
  @ApiQuery({ name: 'token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted',
    type: CreateProductDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found.',
  })
  async deleteProduct(@Query('token') token: string, @Req() req: Request) {
    const { refreshToken } = req.cookies;
    return this.productService.deleteProduct(token, refreshToken);
  }

  @Roles(UserRoles.AUTHOR, UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product created',
    type: SearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found.',
  })
  @ApiBody({ type: searchProductDto })
  @ApiQuery({ name: 'page' })
  async searchProduct(
    @Body() productDto: searchProductDto,
    @Query('page') page: string,
  ) {
    return this.productService.searchProduct(productDto, page);
  }
}


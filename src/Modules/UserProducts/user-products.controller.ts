import { PaymentStatus, PaymentType } from '@/constants/payments';
import { CreateUserProductDto } from '@/dto/user-product.dto';
import { GetUID7 } from '@/extensions/cryptolib.utils';
import { Controller, Get, Post, Body, Param, Res, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../Auth/auth.guard';
import { PaymentsService } from '../Payments/payments.service';
import { ProductService } from '../Products/product.service';
import { TokenService } from '../Tokens/token.service';
import { UserProductsService } from './user-products.service';

@ApiTags('UserProducts')
@Controller('userproducts')
export class UserProductsController {

  constructor(private readonly userProductsService: UserProductsService,
    private readonly paymentsService: PaymentsService,
    private readonly productService: ProductService,
    private readonly tokenService: TokenService) {}

  // @Roles(UserRoles.AUTHOR, UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Get('/products/byuser')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all products',
    type: [CreateUserProductDto]
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async getProductsByUser(
    @Res({ passthrough: true }) res,
  ) {
    const userData = this.tokenService.getTokenData();
    const products = await this.userProductsService.getProductsByUser(userData.id);

    return { products: products };
  }

  @UseGuards(AuthGuard)
  @Get('/users/byproduct/:token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all users for the product',
    type: [CreateUserProductDto]
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Users not found.',
  })
  async getUserByProduct(
    @Param('token') product_token: string,
    @Res({ passthrough: true }) res,
  ) {
    const users = await this.userProductsService.getUsersByProduct(product_token);

    return { users: users };
  }

  @UseGuards(AuthGuard)
  @Post('/add')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Add new product to user products',
    type: [CreateUserProductDto]
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async addUserProduct(
    @Body('product_token') product_token,
    @Res({ passthrough: true }) res,
  ) {
    const userData = this.tokenService.getTokenData();
    const product_db:any = await this.productService.findByToken(product_token);

    const userProductDto: CreateUserProductDto = {
      product_id: product_db._id,
      user_id: userData.id,
      product_payment_type: product_db.product_payment_type,
      product_payment_status: product_db.product_payment_status,
      product_payment_order: product_db.product_payment_order,
      product_payment_amount: product_db.product_payment_amount,
    }

    const product = await this.userProductsService.addUserProduct(userProductDto);

    return { product: product };
  }


  @Get('/guid')
  async getGUID(
    @Res({ passthrough: true }) res,
  ) {
    return { GUID: GetUID7() };
  }

  @UseGuards(AuthGuard)
  @Get('/fill')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetch all products to user products',
    type: [CreateUserProductDto]
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Products not found.',
  })
  async fillUserProducts(
    @Res({ passthrough: true }) res,
  ) {
    const payments = await this.paymentsService.getPayments();
    let userProducts:any[] = [];

    payments.forEach(async (pmt) => {
      const userProductDto: CreateUserProductDto = {
        product_id: pmt.payment_product_id,
        user_id: pmt.payment_user_id,
        product_payment_type: PaymentType.FOR_A_FEE,
        product_payment_status: PaymentStatus.PAID,
        product_payment_order: pmt.payment_order,
        product_payment_amount: pmt.payment_amount,  
      }

      const userProductPromise = this.userProductsService.createUserProduct(userProductDto);
      userProducts.push(userProductPromise);
    })

    // const createValues = await Promise.all(createPromises);
    const userProductsValues = await Promise.allSettled(userProducts);
    
    return { newUserProductsAmount: userProductsValues.length };
  }

}

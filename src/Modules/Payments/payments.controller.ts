import { PaymentsService } from './payments.service';
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { TokenService } from '../Tokens/token.service';
import { AuthGuard } from '@/Modules/Auth/auth.guard';
import { UserProductsService } from '../UserProducts/user-products.service';
import { CreateUserProductDto } from '@/dto/user-product.dto';
import { PaymentStatus, PaymentType } from '@/constants/payments';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private tokenService: TokenService,
    private userProductsService: UserProductsService) {}

  @UseGuards(AuthGuard)
  @Get('/find/:token')
  @HttpCode(HttpStatus.OK)
  async getPayments(
    @Param('token') product_token,
    @Res({passthrough: true}) res) {
    const payments = await this.paymentsService.getPaymentsByToken(product_token);

    return { payments: payments };
  }
  

  @UseGuards(AuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @Body('product_id') product_id: string,
    @Body('amount') amount: string,
    @Body('orderReference') orderReference: string,
    @Res({passthrough: true}) res) {
      const userData = this.tokenService.getTokenData();
      const success = this.paymentsService.createPayment(orderReference, Number(amount), userData.id, product_id);

      //удаляем просроченные не совершенные платежи
      await this.paymentsService.cleanExpiredPayments();

    return { success: success };
  }

  // @Get('/clean')
  // @HttpCode(HttpStatus.OK)
  // async cleanPayments(){
  //   await this.paymentsService.cleanExpiredPayments();
  // }

  @Post('/wayforpay')
  @HttpCode(HttpStatus.OK)
  async checkInvoice(
    @Body() wayforpay:  any,
    @Res({passthrough: true}) res) {

      const wayforpayData = JSON.parse(Object.keys(wayforpay)[0]);

      if(wayforpayData.transactionStatus == "Approved" && 
         wayforpayData.reason == "Ok" &&
         wayforpayData.reasonCode == 1100){
          const payment = await this.paymentsService.approvePayment(wayforpayData.orderReference, wayforpayData);

          if(!!payment){
            
          }
          const userProductDto: CreateUserProductDto = {
              user_id: payment.payment_user_id,
              product_id: payment.payment_product_id,
              product_payment_type: PaymentType.FOR_A_FEE,
              product_payment_status: PaymentStatus.PAID,
              product_payment_order: payment.payment_order,
              product_payment_amount: payment.payment_amount,        
          };

          const userProduct = await this.userProductsService.createUserProduct(userProductDto);
          if(!!userProduct)
            return true;
         }

    return false;
  }
}

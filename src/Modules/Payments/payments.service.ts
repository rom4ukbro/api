import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

import * as util from 'util';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { Payment } from '@/schemas/payment.scheme';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentStatus } from '@/constants/payments';
import { ObjectId } from 'mongodb';
import { Product } from '@/schemas/product.scheme';

@Injectable()
export class PaymentsService {

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>){
    }

  async getPayments(): Promise<any[]> {
    return [];
  }

  async getPaymentsByToken(product_token) {
    const product: any = await this.productModel.findOne({product_token: product_token}).exec();
    const query = [
      { $match: {
          payment_status: PaymentStatus.PAID,
          payment_product_id: new ObjectId(product._id)
        }},
      { $lookup: { from: 'users', localField: 'payment_user_id', foreignField: '_id', as: 'user' }},
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$payment_wayforpay", preserveNullAndEmptyArrays: true } },
      // { $replaceRoot: { newRoot: { $mergeObjects: ['$user', "$$ROOT"] } }},
      // { $replaceRoot: { newRoot: { $mergeObjects: ['$payment_wayforpay', "$$ROOT"] } }}
    ];

    const fields = {
      payment_order: 1,
      payment_amount: 1,
      payment_status: 1,
      payment_wayforpay: {
        amount: 1,
        currency: 1,
        createdDate: 1,
        paymentSystem: 1,
        email: 1,
        phone: 1,
        clientName: 1,
        clientPhone: 1,
        reasonCode: 1,
      },
      user: {
        user_fullname: 1,
        user_email: 1,
        user_phone: 1
      }

    }

    return await this.paymentModel.aggregate(query).project(fields).sort({'payment_wayforpay.createdDate': -1}).exec();
  }
  
  async createPayment(orderReference: string, amount:number, user_id: string, product_id: string) {
      const payment = new this.paymentModel({
            payment_order: orderReference,
            payment_amount: amount,
            payment_user_id: new ObjectId(user_id), 
            payment_product_id: new ObjectId(product_id)});

      await payment.save();
  }

  // async findPayment(orderReference: string): Promise<Payment> {
  //   const payment = await this.paymentModel.findOne({
  //                   orderReference: orderReference, 
  //                   payment_status: PayStatus.NOT_PAID})
  //                   .exec()
  //   return payment;
  // }

  async approvePayment(orderReference: string, wayforpay: any): Promise<Payment> {
    const payment = await this.paymentModel.findOneAndUpdate({
              payment_order: orderReference,
              payment_status: PaymentStatus.NOT_PAID,
              payment_amount: wayforpay.amount
            },{
              $set:{
                payment_wayforpay: wayforpay,
                payment_status: PaymentStatus.PAID,
              }
            });

    return payment;
  }

  async cleanExpiredPayments(): Promise<boolean> {
    //необлаченный платеж сохраняется 5 дней
    const delay5days = 5 * 24 * 60 * 60 * 1000;
    const records = await this.paymentModel.deleteMany({
      payment_created_on: {
          $lte: new Date((new Date().getTime() - delay5days))
      },
      payment_status: PaymentStatus.NOT_PAID,
    })

    return !!records.ok;
  }
}

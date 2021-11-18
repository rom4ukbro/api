import { User } from '@/schemas/user.scheme';
import { Product } from '@/schemas/product.scheme';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProduct } from '@/schemas/user-product.scheme';
import { CreateUserProductDto } from '@/dto/user-product.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserProductsService {
  constructor(
    @InjectModel(UserProduct.name) private readonly userProductModel: Model<UserProduct>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>
    ) {}

  async getProductsByUser(user_id): Promise<UserProduct[]> {
    const query = [
      { $match: { user_id: new ObjectId(user_id)}},
      { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' }},
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $replaceRoot: { newRoot: { $mergeObjects: ['$product', "$$ROOT"] } } },
    ];

    const products = await this.userProductModel.aggregate(query).exec();

    return products;
  }

  async getUsersByProduct(product_token: string): Promise<User[]> {
    const product: any = await this.productModel.findOne({ product_token: product_token}).exec();

    if(!product) return [];

    const query = [
      { $match: { product_id: new ObjectId(product._id)}},
      { $lookup: {from: 'users', localField: 'user_id', foreignField: '_id', as: 'user'}},
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $match: {'user': {$exists: true}}}
    ];

    const fields = {
      user: {
        user_fullname: 1,
        user_email: 1,
        user_phone: 1  
      }
    };

    const users = await this.userProductModel.aggregate(query).project(fields).exec();

    return users;
  }

  async createUserProduct(productDto: CreateUserProductDto): Promise<UserProduct> {
      const userProduct = new this.userProductModel({
        user_id: new ObjectId(productDto.user_id.toString()),
        product_id: new ObjectId(productDto.product_id.toString()),
        product_payment_type: productDto.product_payment_type,
        product_payment_status: productDto.product_payment_status,
        product_payment_order: productDto.product_payment_order,
        product_payment_amount: productDto.product_payment_amount,
      });

      return await userProduct.save();
  }

  async addUserProduct(productDto: CreateUserProductDto): Promise<UserProduct> {
    const userProduct = {      
      user_id: new ObjectId(productDto.user_id.toString()),
      product_id: new ObjectId(productDto.product_id.toString()),
    };

    const userProduct_db = await this.userProductModel.findOne(userProduct).exec();

    if(!!userProduct_db) return null;

    return await this.createUserProduct(productDto);
}

}

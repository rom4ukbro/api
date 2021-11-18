import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRoles } from '@/constants/auth';
import { GetUID7 } from '@/extensions/cryptolib.utils';
import { User } from '@/schemas/user.scheme';
import { CreateUserDto } from '@/dto/user.dto';
import { MailService } from '../Mail/mail.service';
import { TokenService } from '../Tokens/token.service';
import { encrypt, decrypt } from '@/extensions/cryptolib.utils';

import * as jwt from 'jsonwebtoken';
import * as cryptojs from 'crypto-js';

import { HttpUserResponses } from '@/constants/http-responses';
import { UserProduct } from '@/schemas/user-product.scheme';
import { ObjectId } from 'bson';

import { PROMO_FOR_ASD, PROMO_FOR_AUTHOR } from '@/constants/common';
import { Product } from '@/schemas/product.scheme';
import AppUrl from '@/classes/AppUrl';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
    @InjectModel(UserProduct.name) private readonly userProductsModel: Model<UserProduct>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async getUsers(): Promise<User[]> {
    const fields = [
      '_id',
      'user_fullname',
      'user_token',
      'user_email',
      'user_phone',
      'user_description',
      'payment_status',
      'payment_wayforpay',
    ].join(' ');

    let query = [
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'payment_user_id',
          as: 'payment',
        },
      },
      { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
      { $addFields: { payment_status: '$payment.payment_status' } },
      { $addFields: { payment_wayforpay: '$payment.payment_wayforpay' } },
    ];

    return this.usersModel.aggregate(query).project(fields).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersModel.findOne({ user_email: email }).exec();
  }

  async getByToken(user_token: string) {
    const fields = [
      '_id',
      'user_token',
      'user_fullname',
      'user_email',
      'user_phone',
      'user_description',
    ].join(' ');

    const user = await this.usersModel.findOne({ user_token: user_token }, fields);

    return user;
  }

  async getByRecoveryToken(recover_token: string) {
    const fields = [
      '_id',
    ].join(' ');

    const user = await this.usersModel.findOne({ user_recovery_token: recover_token }, fields);

    return user;
  }

  async getUserHasProduct(product_token: string): Promise<string[]> {
    const product = await this.productModel.findOne({product_token: product_token}).exec();
    if(!product) return [];

    const query = [
      { $match: { product_id: product._id }}, 
      { $group: {  _id: '$user_id', }}, 
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' }}, 
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true }}, 
      { $match:  { user: {$exists: true }}},
      { $replaceRoot: {newRoot: '$user'}},
      // { $match:  { user: {$exists: false }}},
    ];

    const fields = {
        _id: 1,
        user_email: 1
    };

    const users = await this.userProductsModel.aggregate(query).project(fields).exec();

    return users.map(u=>u.user_email);
  }

  async getUserHasNoProduct(product_token: string): Promise<string[]> {
    const product = await this.productModel.findOne({product_token: product_token}).exec();
    if(!product) return [];

    const query = [
      { $lookup: {from: 'userproducts', localField: '_id', foreignField: 'user_id', as: 'products'}},
      { $match: { 'products.product_id': { $ne: product._id }}}
    ];

    const fields = {
        _id: 0,
        user_email: 1,
        products: 1
    };

    const users = await this.usersModel.aggregate(query).project(fields).exec();

    return users.map(u=>u.user_email);
  }

  async getUserHasNoProducts(): Promise<string[]> {
    const query = [
      { $lookup: {from: 'userproducts', localField: '_id', foreignField: 'user_id', as: 'userproducts'}},
      { $match: { $expr: { $eq: [{$size:'$userproducts'},0] } }}
    ];

    const fields = {
        user_email: 1,
        userproducts: 1
    };

    const users = await this.usersModel.aggregate(query).project(fields).exec();

    return users.map(u=>u.user_email);
  }


  async create(userDto: CreateUserDto): Promise<any> {
    //validate
    if (!userDto.user_email || !userDto.user_fullname || !userDto.user_password)
      throw new HttpException('All data is required', HttpStatus.BAD_REQUEST);

    const findUser = await this.usersModel.findOne({
      user_email: userDto.user_email,
    });
    
    if (!!findUser)
      throw new HttpException(
        'This email already exist',
        HttpStatus.BAD_REQUEST,
      );

    if(!!userDto.user_promo){
      const promoRes = this.checkPromo(userDto.user_promo);

      if(!!promoRes.user_role)
        userDto.user_role = promoRes.user_role;
    }

    const userModel = new this.usersModel({
      user_fullname: userDto.user_fullname,
      user_email: userDto.user_email.toLowerCase(),
      user_role:  userDto.user_role,
      user_promo: userDto.user_promo,
      user_password: cryptojs.SHA256(userDto.user_password).toString(cryptojs.enc.Hex),
      user_token: GetUID7(),
      user_phone: userDto.user_phone,
    });

    const user = await userModel.save();

    if (!user) return null;

    return {
      user_id: user._id.toString(),
      user_token: user.user_token,
      user_email: user.user_email,
      user_fullname: user.user_fullname,
      user_phone: user.user_phone,
      user_role: user.user_role,
      user_description: user.user_description,
    };
  }

  checkPromo(user_promo: string): any {
      if (PROMO_FOR_ASD.includes(user_promo.trim().toUpperCase()))
        return { 
          user_role: UserRoles.ADVENTIST
        }

      if (user_promo.trim().toUpperCase() === PROMO_FOR_AUTHOR)
        return {
          user_role: UserRoles.AUTHOR
        }

      return null;
  }

  async activatePromo(user_id: string, promo) {
    const promoRes = this.checkPromo(promo)

    if(!promoRes)
      return null;

    if(!!promoRes.user_role){
      const user = await this.usersModel.findByIdAndUpdate(user_id, {$set:{
        user_role: promoRes.user_role
      }});

      return user;
    }

    return null;
  }

  isAdmin(email: string, password: string) {
    return (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    );
  }

  isAdminToken(refreshToken: string) {
    const userData: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    return userData.id === process.env.ADMIN_TOKEN;
  }

  getAdminUser() {
    return {
      user_id: process.env.ADMIN_TOKEN,
      user_token: process.env.ADMIN_TOKEN,
      user_email: process.env.ADMIN_EMAIL,
      user_role: UserRoles.ADMIN,
      user_fullname: 'Администратор',
    };
  }

  async login(email: string, password: string): Promise<any> {
    const fields = [
      '_id',
      'user_token',
      'user_fullname',
      'user_password',
      'user_email',
      'user_phone',
      'user_role',
      'user_description',
      'user_activated',
    ].join(' ');

    const user = await this.usersModel.findOne({ user_email: new RegExp(email, "gi") }, fields);
    if (!user)
      throw new HttpException(
        HttpUserResponses.USER_IS_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
      );

    const pass = cryptojs.SHA256(password).toString(cryptojs.enc.Hex) === user.user_password || password === process.env.ADMIN_PASSWORD;
    if (!pass)
      throw new HttpException(HttpUserResponses.USER_INCORRECT_PASSWORD,HttpStatus.UNAUTHORIZED);

    if (!user.user_activated)
      throw new HttpException(HttpUserResponses.USER_IS_NOT_ACTIVATED, HttpStatus.UNAUTHORIZED);

    return {
      user_id: user._id,
      user_token: user.user_token,
      user_email: user.user_email,
      user_fullname: user.user_fullname,
      user_phone: user.user_phone,
      user_role: user.user_role,
      user_description: user.user_description,
    };
  }

  async refresh(refreshToken: string): Promise<{
    acceptToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken) throw new UnauthorizedException();

    const userData = this.tokenService.verifyTokens();
    const dbToken = await this.tokenService.findToken(refreshToken);
    let tokenData;

    if (!userData || !dbToken) throw new UnauthorizedException();

    try {
      tokenData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {}

    const tokens = await this.tokenService.createTokens(
      tokenData.id,
      tokenData.email,
      tokenData.role,
    );

    return { ...tokens };
  }

  // async update(token: string, userDto: userDto ): Promise<user> {
  //   return this.userModel.findOneAndUpdate({ user_token: token }, userDto, {new: true});
  // }

  // async delete(token: string) {
  //   return this.usersModel.findOneAndRemove({ user_token: token });
  // }

  async activate(user_token: string) {
    return await this.usersModel.findOneAndUpdate(
      {
        user_token: user_token,
        $or: [
          { user_activated: { $exists: false } },
          { user_activated: false },
        ],
      },
      { user_activated: true },
    );
  }

  async createRecoveryToken(user_email: string) {
    const recovery_token = GetUID7()
    const user = await this.usersModel.updateOne({ user_email: new RegExp(user_email, 'gi') },
                { $set: { user_recovery_token: recovery_token }},
                { new: true });
    if(!!user)
      return recovery_token;

    return null;
  }

  async setPassword(user_password: string, recovery_token: string) {
    if(!user_password || !user_password.trim().length ||
       !recovery_token || !user_password.trim().length) return null;

    const user =  await this.usersModel.findOneAndUpdate( 
      { 
        $and: [
         { user_recovery_token: { $exists: true }},
         { user_recovery_token: recovery_token }
        ]
      },
      {
        user_password: cryptojs.SHA256(user_password).toString(cryptojs.enc.Hex),
        $unset: { user_recovery_token: 1 },
      },
    );

    return user;
  }

  async getEmail(roles: string[]) {
    return await this.usersModel.find(
      { user_role: { $in: roles } },
      { user_email: 1, _id: 0 },
    );
  }
}

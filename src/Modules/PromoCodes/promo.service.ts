import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import { PromoCode } from '@/schemas/promo.scheme';
import { CreatePromoDto } from '@/dto/promo.dto';

@Injectable()
export class PromoService {

  constructor( 
    @InjectModel(PromoCode.name) private readonly promoModel: PaginateModel<PromoCode>,
    private promoService: PromoService) {}

  async getPromoCodes(): Promise<PromoCode[]> {
    return this.promoModel.find().exec();
  }

  async create(promoDto: CreatePromoDto) {
    const promoCode = new this.promoModel(promoDto);
    return promoCode.save();
  }
}
    

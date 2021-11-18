import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import { Product } from '@/schemas/product.scheme';
import { searchProductDto } from '@/dto/search-product.dto';
import { CreateProductDto } from '../../dto/product.dto';
import { BroadcastService } from '../Broadcast/broadcast.service';
import { StudyService } from './../Study/study.service';
import { User } from '@/schemas/user.scheme';
import { TokenService } from '../Tokens/token.service';
import { ObjectId } from 'mongodb';
import { PaymentsService } from '../Payments/payments.service';
import { Payment } from '@/schemas/payment.scheme';
import { UserProduct } from '@/schemas/user-product.scheme';
import { ProductType } from '@/constants/product';
import ResoursesService from '@/classes/ResoursesService';
import * as FileHelper from '@/extensions/file.utils';
import { writeFileSync } from 'fs';
import { GetUID7 } from '@/extensions/cryptolib.utils';

@Injectable()
export class ProductService {

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: PaginateModel<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserProduct.name) private readonly userProductsModel: Model<UserProduct>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    private studyService: StudyService,
    private liveStreamService: BroadcastService,
    private tokenService: TokenService,
  ) {}

  async findByStore(store_id: string, user_id: string): Promise<Product[]> {
    const query: any = {
                product_store: Number(store_id), 
                product_is_published: true
              };
    const userProducts = await this.userProductsModel.find({user_id: new ObjectId(user_id)}).exec();
    const userProductIds = userProducts.map(p => p.product_id);

    const products = !userProductIds.length ? 
                       await this.productModel.find(query).exec() :
                       await this.productModel.aggregate([
                         { $match: { 
                              product_store: Number(store_id),
                              product_is_published: true
                            }
                          },
                         { $addFields: {'product_in_briefcase': {$in:['$_id', userProductIds]} }}
                        ]).exec();

    return products;
  }

  async getUserProducts(user_id: string = null): Promise<Product[]> {
      let subQuery = [ 
          { $match: { user_id: new ObjectId(user_id) } },
          { $group: { 
              _id: new ObjectId(user_id),
              product_ids: { $push: '$product_id' }
          } } 
        ];
  
      const userProducts = await this.userProductsModel.aggregate(subQuery).exec();
      const userProductsIds = !!userProducts[0] ? userProducts[0].product_ids : null;

      if(!userProductsIds || !!userProductsIds.length)
        return null;

      
    const query: any = {$match: { _id: {$in: userProductsIds }}};
    const products = await this.productModel.aggregate(query).exec();

    return products;
  }

  async findById(product_id: string): Promise<any> {
    const product = await this.productModel.findOne({_id: new ObjectId(product_id)}).exec();
    return product;
  }

  async findByAuthorId(user_id: string): Promise<Product[]> {
    if(!user_id) return null;
    
    const products = await this.productModel.find({ product_author_id: new ObjectId(user_id) }).exec();
    return products;
  }  

  async findByToken(product_token: string): Promise<any> {
    const product = await this.productModel.findOne({product_token: product_token}).exec();
    return product;
  }

  async findByTokenWithPayment(token: string, user_id: string) {
    const fields = {
      product_image_card: 1,
      product_image_cover: 1,
      product_content: 1,
      product_discounts: 1,
      product_skills: 1,
      product_is_published: 1,
      product_token: 1,
      product_modified_at: 1,
      product_created_at: 1,
      product_title: 1,
      product_type: 1,
      product_description: 1,
      product_user_fullname: 1,
      product_user_image: 1,
      product_start_datetime: 1,
      product_language: 1,
      product_students: 1,
      product_category: 1,
      product_tags: 1,
      product_speakers: 1,
      product_resources: 1,
      product_episodes: 1,
      product_payment_type: 1,
      product_price: 1,
      product_primary_price: 1,
      product_email: 1
    };

    const product_db: any = await this.productModel
      .findOne({ product_token: token }, fields)
      .exec();

    if (!product_db) return null;

    const product: any = Object.assign({}, product_db._doc);

    if (!!product_db && !!user_id) {
      // const payment: any = await this.paymentModel
      //   .findOne({
      //     payment_product_id: new ObjectId(product_db._id),
      //     payment_user_id: new ObjectId(user_id),
      //     payment_status: PaymentStatus.PAID,
      //   })
      //   .exec();

        const userProduct: any = await this.userProductsModel
        .findOne({
          product_id: new ObjectId(product_db._id),
          user_id: new ObjectId(user_id)
        })
        .exec();

      // product.product_payment_status = !!product ? PaymentStatus.PAID : null;
      product.product_is_obtained = !!userProduct ? true : false;
    }

    return product;
  }

  saveCover(token, content, ext){
    const filename = token.toLowerCase() + '-' + FileHelper.uniqFileID() + ext;
    const path = ResoursesService.getCoversPath(filename);

    writeFileSync(path, content);
    return filename;
  }

  saveSpeaker(token, content, ext){
    const filename = token.toLowerCase() + '-' + FileHelper.uniqFileID() + ext;
    const path = ResoursesService.getSpeakersPath(filename);

    writeFileSync(path, content);
    return filename;
  }

  removeSpeaker(file){
    const filename_db = FileHelper.getFileFromPath(file);

    if(!!filename_db){
      const oldFile = ResoursesService.getSpeakersPath(filename_db);
      FileHelper.removeFile(oldFile);
    }
  }

  saveDownload(token, content, ext){
    const filename = token.toLowerCase() + '-' + FileHelper.uniqFileID() + ext;
    const path = ResoursesService.getDownloadsPath(filename);

    writeFileSync(path, content);
    return filename;
  }

  removeDownload(file){
    const filename_db = FileHelper.getFileFromPath(file);

    if(!!filename_db){
      const oldFile = ResoursesService.getDownloadsPath(filename_db);
      FileHelper.removeFile(oldFile);
    }
  }

  async createEvent(dto: CreateProductDto){

    const newProduct = new this.productModel({
      product_title: dto.product_title,
      product_token: GetUID7(),
      product_description: dto.product_description,
      product_language: dto.product_language,
      product_email: dto.product_email,
      product_is_published: false,
      product_type: ProductType.EVENT,
      product_store: dto.product_store,
      product_payment_type: dto.product_payment_type,
      product_price: Number(dto.product_price),
      product_primary_price: Number(dto.product_primary_price),
      product_discounts: dto.product_discounts,
      product_author_id:new ObjectId(dto.product_author_id),
      // product_author_fullname: dto.product_author_fullname,
      // product_author_image: dto.product_author_image,
      product_start_datetime: dto.product_start_datetime,
      product_skills: dto.product_skills,
      product_speakers: dto.product_speakers,
      product_speakers_primary_index: dto.product_speakers_primary_index,
      product_resources: dto.product_resources,
      product_episodes: dto.product_episodes,
      product_tags: dto.product_tags,
     });
 
     if(!!dto.product_image_card_file){
       const file = FileHelper.decodeBase64(dto.product_image_card_file);
       newProduct.product_image_card = ResoursesService.getCoversUrl(this.saveCover( newProduct.product_token, file.data, file.ext));
     }
 
     if(!!dto.product_image_cover_file){
       const file = FileHelper.decodeBase64(dto.product_image_cover_file);
       newProduct.product_image_cover = ResoursesService.getCoversUrl(this.saveCover(newProduct.product_token, file.data, file.ext));
     }
 
     if(!!dto.product_speakers){
       dto.product_speakers.map(speaker => {
         const file = FileHelper.decodeBase64(speaker.speaker_photo);
         speaker.speaker_photo = ResoursesService.getSpeakersUrl(this.saveSpeaker(newProduct.product_token, file.data, file.ext));
       })
     }
 
    return newProduct.save();
  }

  async createCourse(productDto: CreateProductDto){
    const newProduct = new this.productModel(productDto);
    return newProduct.save();
  }

  async subscribe(studentToken, productToken) {
    this.studyService.createStudy(studentToken, productToken);

    this.userModel.updateOne(
      { user_token: studentToken },
      { $push: { user_products: productToken } },
    );

    return this.productModel.updateOne(
      { user_token: productToken },
      { $inc: { user_students: 1 } },
    );
  }

  async addFav(studentToken: string, productToken: string) {
    return await this.userModel.updateOne(
      { user_token: studentToken },
      { $push: { user_fav_products: productToken } },
    );
  }

  async getFav(tokens: [string]) {
    return await this.productModel.find({
      product_token: {
        $in: tokens,
      },
    });
  }

  async updateProduct(dto: any): Promise<Product> {
    const product_db = await this.productModel.findOne({_id: new ObjectId(dto._id)}).exec();

    if(!!dto.product_image_cover){
      const file = FileHelper.decodeBase64(dto.product_image_cover);
      const filename = this.saveCover(product_db.product_token, file.data, file.ext);

      dto.product_image_cover = ResoursesService.getCoversUrl(filename);
      
      if(!!product_db.product_image_cover){
        const filename = FileHelper.getFileFromPath(product_db.product_image_cover);

        if(!!filename){
          const oldFile = ResoursesService.getCoversPath(filename);
          FileHelper.removeFile(oldFile);  
        }
      }
    } 

    if(!!dto.product_image_card){
      const file = FileHelper.decodeBase64(dto.product_image_card);
      const filename = this.saveCover(product_db.product_token, file.data, file.ext);

      dto.product_image_card = ResoursesService.getCoversUrl(filename);
      
      if(!!product_db.product_image_card){
        const filename = FileHelper.getFileFromPath(product_db.product_image_card);

        if(!!filename){
          const oldFile = ResoursesService.getCoversPath(filename);
          FileHelper.removeFile(oldFile);    
        }
      }
    } 

    if(!!dto.product_speakers){

      const speakers_db_ids = dto.product_speakers.map(s=>s._id);
      const speakers_deleted = product_db.product_speakers.filter(s => !speakers_db_ids.includes(s._id));

      //удаляем фото при отсутствии в базе
      speakers_deleted.map(s=> this.removeSpeaker(s.speaker_photo))

      dto.product_speakers
        .filter(s => FileHelper.isBase64(s.speaker_photo) )
        .map(speaker => {

          const file = FileHelper.decodeBase64(speaker.speaker_photo);
          const filename = this.saveSpeaker(product_db.product_token, file.data, file.ext);

          speaker.speaker_photo = ResoursesService.getSpeakersUrl(filename);

          //удаляем фото при обновлении
          product_db.product_speakers
            .filter(s => s._id == speaker._id)
            .map(s=> this.removeSpeaker(s.speaker_photo));
      })
    }

    if(!!dto.product_episodes){

      dto.product_episodes.map((e,index) => {

        const downloads_ids = e.downloads.map(e=>e._id);
        const downloads_db = product_db.product_episodes[index].downloads;
        const downloads_deleted = !!downloads_db ? downloads_db.filter(d => !downloads_ids.includes(d._id)) : [];
  
        //удаляем файл при отсутствии в базе
        downloads_deleted.map(s=> this.removeDownload(s.url))
  
        e.downloads
          .filter(d => FileHelper.isBase64(d.file) )
          .map(d => {
  
            const file = FileHelper.decodeBase64(d.file);
            const fileExt = FileHelper.getFileExt(d.originalname);
            const filename = this.saveDownload(product_db.product_token, file.data, fileExt);
  
            d.url = ResoursesService.getDownloadsUrl(filename),
            delete d.file;  
        })
  
      })
    }

    const product_updated = await this.productModel.findOneAndUpdate({ _id: dto._id }, dto as any, { new: true }).exec();

    return product_updated;
  }

  async deleteProduct(token: string, refreshToken: string) {
    const tokenData = this.tokenService.verifyTokens();
    if (!tokenData) throw new ForbiddenException();
    return this.productModel.findOneAndRemove({ token: token });
  }

  async searchProduct(
    conditions: searchProductDto,
    page: string,
  ): Promise<PaginateResult<Product>> {
    let $and = [];
    let sort: { [key: string]: any } = {};
    if (
      conditions.product_created_at &&
      conditions.product_created_at.length == 2
    ) {
      $and.push({
        product_created_at: {
          $gte: conditions.product_created_at[0],
          $lt: conditions.product_created_at[1],
        },
      });
    }
    if (
      conditions.product_modified_at &&
      conditions.product_modified_at.length == 2
    ) {
      $and.push({
        product_created_at: {
          $gte: conditions.product_modified_at[0],
          $lt: conditions.product_modified_at[1],
        },
      });
    }
    if (
      conditions.product_start_datetime &&
      conditions.product_start_datetime.length == 2
    ) {
      $and.push({
        product_created_at: {
          $gte: conditions.product_start_datetime[0],
          $lt: conditions.product_start_datetime[1],
        },
      });
    }
    if (conditions.product_title) {
      $and.push({
        product_title: {
          $regex: RegExp(conditions.product_title, 'i'),
        },
      });
    }
    if (conditions.product_type) {
      $and.push({ product_type: { $in: conditions.product_type } });
    }
    if (conditions.product_user_fullname) {
      $and.push({
        product_user_fullname: {
          $regex: RegExp(conditions.product_user_fullname, 'i'),
        },
      });
    }
    if (conditions.product_language) {
      $and.push({ product_language: { $in: conditions.product_language } });
    }
    if (conditions.product_skills) {
      $and.push({ product_skills: { $in: conditions.product_skills } });
    }
    if (conditions.product_category) {
      $and.push({ product_category: { $in: conditions.product_category } });
    }
    if (conditions.product_price && conditions.product_price.length == 2) {
      $and.push({
        product_created_at: {
          $gte: conditions.product_price[0],
          $lte: conditions.product_price[1],
        },
      });
    }
    if (conditions.product_discounts) {
      $and.push({ product_discounts: { $exists: true, $gte: 1 } });
    }
    if (conditions.sortBy) {
      sort[conditions.sortBy.field] = conditions.sortBy.order;
    } else {
      sort.product_students = -1;
      sort.product_created_at = -1;
    }
    $and.push({ product_is_published: true });
    if ($and.length === 0) {
      return this.productModel.paginate(
        {
          sort: sort,
        },
        {
          page: parseInt(page, 10) ?? 1,
          limit: 5,
        },
      );
    }
    return this.productModel.paginate(
      {
        $and: $and,
      },
      {
        page: parseInt(page, 10) ?? 1,
        limit: 5,
        sort: sort,
        populate: {
          _id: 0,
          product_created_at: 1,
          product_modified_at: 1,
          product_token: 1,
          product_title: 1,
          product_type: 1,
          product_description: 1,
          product_user_fullname: 1,
          product_user_image: 1,
          product_start_datetime: 1,
          product_language: 1,
          product_image: 1,
          product_skills: 1,
          product_students: 1,
          product_price: 1,
          product_discounts: 1,
        },
      },
    );
  }

  async updateUploads(product: Product) {

    // const getFiles = pathList => pathList.map(f => f.match(/[^\/.]+(\..{1,4})$/g)[0]);
    // const filterByProduct = file =>file.indexOf(product.product_token.toLowerCase()) == 0;

    // //COVERS
    // const covers = await scanFiles(ResoursesService.getCoversPath('/')).filter( filterByProduct );
    // const coversDb = getFiles([product.product_image_card, product.product_image_cover]);
    // const coversToDelete = getFiles(covers).filter(f => !coversDb.includes(f));
        
    // //SPEAKERS
    // const speakers = await scanFiles(ResoursesService.getSpeakersPath('/')).filter( filterByProduct )
    // const speakersDb = getFiles(product.product_speakers.map(sp=>sp.speaker_photo));
    // const speakersToDelete = getFiles(speakers).filter(f => !speakersDb.includes(f));

    // //DOWNLOADS
    // const downloads = await scanFiles(ResoursesService.getDownloadsPath('/')).filter( filterByProduct )
    // const downloadsDb = getFiles(product.product_episodes.map(e=> e.downloads.map( d => d.url).flat(1)));
    // const downloadsToDelete = getFiles(downloads).filter(f => !downloadsDb.includes(f));

    // await removeFiles([
    //   coversToDelete.map(f => ResoursesService.getCoversPath(f)),
    //   speakersToDelete.map(f => ResoursesService.getSpeakersPath(f)),
    //   downloadsToDelete.map(f => ResoursesService.getDownloadsPath(f)),
    // ].flat(1))

}

}

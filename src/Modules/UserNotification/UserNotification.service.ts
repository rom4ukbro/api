import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import { NotificationDto as UserNotificationDto } from '../../dto/notification.dto';
import { NotificationStatus } from '@/constants/common';
import { UserNotification } from '@/schemas/user-notifications.scheme';

@Injectable()
export class UserNotificationService {
  constructor(@InjectModel(UserNotification.name) private readonly userNotifModel: PaginateModel<UserNotification>) {}

  async create(notifDto: UserNotificationDto) {
    const notification = new this.userNotifModel(notifDto);
    return notification.save();
  }

  async update(notifDto: UserNotificationDto) {
    const _id = notifDto._id;
    delete notifDto._id;
    return this.userNotifModel.findByIdAndUpdate(_id, notifDto);
  }

  async getReaded(_id) {
    return this.userNotifModel.updateOne({ _id: _id },{ notif_status: NotificationStatus.READ });
  }

  async getNotification(token: string, page: number, limit: number) {
    return this.userNotifModel.paginate({ user_token: token },
      {
        page: page,
        limit: limit,
        sort: { ntf_created_at: -1 },
      },
    );
  }

  async delete(_id) {
    return this.userNotifModel.deleteOne({ _id: _id });
  }
}

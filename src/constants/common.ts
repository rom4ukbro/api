export const PROMO_FOR_ASD = 'PROMO_FOR_ASD';
export const PROMO_FOR_AUTHOR = 'PROMO_FOR_AUTHOR';

export enum NotificationStatus {
  NEW = 1,
  READ = 2,
}

export type Answers = {
  test_id: string;
  true_answers: Array<{}>;
  user_answers: Array<{}>;
};

export type Language = 'ua' | 'ru' | 'en';

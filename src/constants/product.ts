export enum ProductType {
    COURSE = 1,
    WEBINAR = 2,
    EVENT = 3,
  }
  
  export enum ProductStore {
    PUBLIC = 1,
    ASD_MISSION = 2,
    ASD_SCHOOL = 3,
  }

  type Test = {
    questionText: string;
    options: [
      {
        text: string;
        id: string;
      },
    ];
    rightAnswer: string; // id
  };
  
  type ModuleType = 'text' | 'video' | 'question' | 'test' | 'image';
  
  export type ProductModuleType = {
    type: ModuleType;
    id: number;
    title: string;
    duration?: string;
    path?: string;
    url?: string;
    test?: Test;
    text?: string;
  };
    
  export type DiscountsType = {
    text: string;
    value: number;
  };
  
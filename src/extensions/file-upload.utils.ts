import { extname } from "path";

import * as fs from 'fs';
import { GetUID7 } from "./cryptolib.utils";
import { uniqFile } from "./file.utils";

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  };

export const uniqFileName = (req, file, callback) => {
  const uniqname = uniqFile(file.originalname)
  callback(null, `${uniqname}`);
};

// --- PRODUCTS ----

export const productFileName = (req, file, callback) => {
  const productToken = req.body.product_token.toLowerCase();
  const uniqname = uniqFile(file.originalname)
  callback(null, `${productToken}-${uniqname}`);
};

export const imagesPath = (req, file, callback) => {
  let directory = `${process.env.APP_FILES}/images/covers`;;

  if(['product_speakers'].includes(file.fieldname))
      directory = `${process.env.APP_FILES}/images/speakers`;

  if(['product_downloads'].includes(file.fieldname))
      directory = `${process.env.APP_FILES}/images/downloads`;


  if (!fs.existsSync(directory))
       fs.mkdirSync(directory,{recursive: true});

  callback(null, directory);
};

export const coversPath = (req, file, callback) => {
  let directory = `${process.env.APP_FILES}/images/covers`;;

  if (!fs.existsSync(directory))
       fs.mkdirSync(directory,{recursive: true});

  callback(null, directory);
};

export const speakersPath = (req, file, callback) => {
  let directory = `${process.env.APP_FILES}/images/speakers`;;

  if (!fs.existsSync(directory))
       fs.mkdirSync(directory,{recursive: true});

  callback(null, directory);
};

export const downloadsPath = (req, file, callback) => {
  let directory = `${process.env.APP_FILES}/downloads`;;

  if (!fs.existsSync(directory))
       fs.mkdirSync(directory,{recursive: true});

  callback(null, directory);
};

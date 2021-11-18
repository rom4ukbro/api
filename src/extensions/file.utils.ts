import * as util from 'util';
import * as fs from 'fs'
import {promises as fsPromises} from 'fs';
import { extname } from 'path';
import { Readable } from 'stream';

const path = require('path');

export default {}

export function getFileExt(filename){
  return filename.match(/\.(.{2,4})$/)[0];
}

export function getFileFromPath(path){
  const match = path.match(/[^\/.]+(\..{1,4})$/g);

  if(!match) return null;

  return match[0]
}

export function readFiles(dirname){

    const readDirPr = new Promise( (resolve, reject) => {
      fs.readdir(dirname, 
        (err, filenames) => (err) ? reject(err) : resolve(filenames))
    });
  
    return readDirPr.then( (filenames:string[]) => Promise.all(filenames.map((filename) => {

      if (fs.lstatSync(dirname + filename).isDirectory()){
        return readFiles(dirname + filename);
        }

        return new Promise ( (resolve, reject) => {
          fs.readFile(dirname + filename, 'utf-8',
            (err, content) => (err) ? reject(err) : resolve({filename: filename, content: content}));
        })
      })).catch( error => Promise.reject(error)))
  };

export async function scanFiles(dirname:string) {
  const readDirPr = new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, filenames) => (err) ? reject(err) : resolve(filenames))
  });

  const files = readDirPr.then((filenames: string[]) => filenames.map(filename => {
    const path = dirname + '/' + filename;

    if (fs.lstatSync(path).isDirectory())
      return scanFiles(path);
    else
      return path;
  }))

  return !!files ? files :  [];
};

export async function removeFiles(files: string[]){
  let counter = 0;

  files.forEach(file => {
    removeFile(file)
    counter++;
  });

  if(counter > 0)
    console.log(`all ${counter} files has removed`);
}

export async function removeFile(file: string) {
  if (fs.existsSync(file)){
      fs.unlink(file, (err) => {
        if (err) {
          console.error(err)
          return;
        }
      })
  }
}

export async function writeFile(path, str) {
  const writeFilePromise = util.promisify(fs.writeFile);
  await writeFilePromise(path, str);
}

export function writeFileSync(file: string, content: any) {
  if (!fs.existsSync(file))
       fs.unlinkSync(file)
}

export function removeFileSync(file: string) {
  if (fs.existsSync(file))
      fs.unlinkSync(file)
}

export async function removeEmptyDirectories(directory) {

    // lstat does not follow symlinks (in contrast to stat)
    const fileStats = await fsPromises.lstat(directory);
    if (!fileStats.isDirectory()) {
      return;
    }

    let fileNames = await fsPromises.readdir(directory);

    if (fileNames.length > 0) {
      const recursiveRemovalPromises = fileNames.map(
        (fileName) => removeEmptyDirectories(path.join(directory, fileName)),
      );
      await Promise.all(recursiveRemovalPromises);

      // re-evaluate fileNames; after deleting subdirectory
      // we may have parent directory empty now
      fileNames = await fsPromises.readdir(directory);
    }

    if (fileNames.length === 0) {
      console.log('Removing empty folder: ', directory);
      await fsPromises.rmdir(directory);
    }
  }

export function createDirectory(directory){
  if (!fs.existsSync(directory))
       fs.mkdirSync(directory,{recursive: true});
}

export const uniqFile = (filename) => {
  const fileExtName = extname(filename);
  const randomName = Array(12)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(36))
    .join('');

  return `${randomName}${fileExtName}`;
};

export const uniqFileID = () => {
  const randomName = Array(12)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(36))
    .join('');

  return `${randomName}`;
};

export function sendHttpText(res: any, filename:string, data: any){
  const file_type = extname(filename).replace(/\./,'');

  res.set({
    'Content-Type': `application/${file_type};filename=${filename}`,
    'Content-Length': Buffer.byteLength(data, 'utf8'),
  });

  const stream = new Readable();
  stream.push(data);
  stream.push(null);
  stream.pipe(res);
}

export function sendHttpBinary(res: any, filename: string, data: any) {

  res.set({
    'Content-Type': `application/octet-stream;filename=${filename}`,
    'Content-Length': data.byteLength,
    // 'Content-Disposition': 'attachment',
  });

  getReadableStream(data).pipe(res);
}

function getReadableStream(buffer: Buffer): Readable {
  const stream = new Readable();

  stream.push(buffer);
  stream.push(null);

  return stream;
}

export function decodeBase64(dataString) 
{
  var matches = dataString.match(/^data:([A-Za-z-+\/\.]+);base64,(.+)$/);
  var response: any = {};

  if(!matches) return null;

  if (matches.length !== 3)
    return new Error('Invalid input string');

  response.type = matches[1];
  response.data = Buffer.from(matches[2], 'base64');

  const image_matches = response.type.match(/^image\/([A-Za-z]+)$/);
  response.ext =  !!image_matches ? '.' + image_matches[1] : '';

  return response;
}

export function isBase64(dataString: string) {
  if(!dataString) return false;
  
  var matches = dataString.match(/^data:([A-Za-z-+\/\.]+);base64,(.+)$/);
  return !!matches;
}


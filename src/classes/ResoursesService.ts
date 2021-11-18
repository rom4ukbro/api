import { removeFile, scanFiles } from "@/extensions/file.utils";

export default class ResoursesService {

    static getPath(imageName){
        return [process.env.APP_FILES, imageName].join('/');
    }

    static getCoversUrl(imageName){
        return ['/images/covers', imageName].join('/');
    }

    static getCoversPath(imageName){
        return [process.env.APP_FILES, 'images/covers', imageName].join('/');
    }

    static getSpeakersPath(imageName){
        return [process.env.APP_FILES, 'images/speakers', imageName].join('/');
    }

    static getSpeakersUrl(imageName){
        return ['/images/speakers', imageName].join('/');
    }

    static getDownloadsUrl(imageName){
        return ['/downloads', imageName].join('/');
    }

    static getDownloadsPath(imageName){
        return [process.env.APP_FILES, 'downloads', imageName].join('/');
    }

    static async getSpeakersFilesByToken(productToken : string): Promise<any[]>{
        const speakersPhotos = await scanFiles(ResoursesService.getSpeakersPath('/'));

        return speakersPhotos
            .map(f => f.match(/[^\/.]+(\..{1,4})$/g)[0])
            .filter( fn =>fn.indexOf(productToken.toLowerCase()) == 0)
    }
}
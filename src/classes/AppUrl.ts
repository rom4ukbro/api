export default class AppUrl {
    static getApi(path): string {
        return process.env.APP_API_ENDPOINT + path;
      }
    
    static getUi(path): string {
        return process.env.APP_UI_ENDPOINT + path;
    }
}
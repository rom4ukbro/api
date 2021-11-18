export const MONGO_CLIENT_OPTIONS = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 5,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
};

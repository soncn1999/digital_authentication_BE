import express from 'express';
import homeController from '../controllers/homeController';

let router = express.Router();

let initWebRoutes = (app) => {
    router.post('/api/create-user', homeController.createNewUser);

    router.get('/api/login', homeController.loginUser);

    router.post('/api/create-signature', homeController.createSignature);

    router.post('/api/verify-signature', homeController.verifySignature);

    router.post('/api/encrypt-data', homeController.encryptData);

    router.post('/api/decrypt-data', homeController.decryptData);

    return app.use("/", router);
}

module.exports = initWebRoutes;
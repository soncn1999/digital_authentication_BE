import express from 'express';
import homeController from '../controllers/homeController';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/create-user', homeController.createUser);

    router.post('/create-new-user',homeController.createUserCRUD);

    router.get('/edit-user', homeController.editUser);

    router.post('/update-user', homeController.updateUserInfoCRUD);

    return app.use("/", router);
}

module.exports = initWebRoutes;
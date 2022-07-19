import db from '../models/index';
import CRUDService from '../services/CRUDService';

let createUser = async (req, res) => {
    let listUser = await CRUDService.getListUser();
    return res.render('createUser', {
        users: listUser,
    });
}

let createUserCRUD = async (req, res) => {
    let data = req.body;
    let newUser = await CRUDService.createNewUser(data);
    return res.render('createUser', {
        users: newUser,
    });
}

module.exports = {
    createUser: createUser,
    createUserCRUD: createUserCRUD,
};
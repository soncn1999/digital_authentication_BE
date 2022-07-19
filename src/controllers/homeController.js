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

let editUser = async (req, res) => {
    let userId = req.query.id;
    let userEdit = await CRUDService.editUserCRUD(userId);
    console.log(userEdit);
    return res.render('editUser.ejs', {
        user: userEdit,
    });
}

let updateUserInfoCRUD = async (req, res) => {
    let user = req.body;
    let userUpdateInfo = await CRUDService.updateUserInfoCRUD(user);
    return res.render('createUser',{
        users : userUpdateInfo,
    });
}

module.exports = {
    createUser: createUser,
    createUserCRUD: createUserCRUD,
    editUser: editUser,
    updateUserInfoCRUD: updateUserInfoCRUD
};
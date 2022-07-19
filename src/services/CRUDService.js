import db from '../models/index';
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let password = await hashPassword(data.password);
            await db.User.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: password,
                address: data.address,
                phonenumber: data.phonenumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId
            });
            let userList = await db.User.findAll();
            resolve(userList);
        } catch (error) {
            reject(error);
        }
    });
}

let hashPassword = (plaintPass) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hash = await bcrypt.hashSync(plaintPass, salt);
            resolve(hash);
        } catch (error) {
            reject(error);
        }
    });
}


let getListUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let listUser = await db.User.findAll();
            if (listUser) {
                resolve(listUser);
            } else {
                resolve([]);
            }
        } catch (error) {
            reject(error);
        }
    })
}

let editUserCRUD = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userEditInfo = await db.User.findOne({
                where: { id: userId },
                raw: true,
            });
            if (userEditInfo) {
                resolve(userEditInfo);
            } else {
                resolve([]);
            }
        } catch (error) {
            reject(error);
        }
    });
}

let updateUserInfoCRUD = (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.User.update({
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                phonenumber: user.phonenumber,
            }, { where: { id: user.id } });
            let listUser = db.User.findAll();
            resolve(listUser);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    createNewUser: createNewUser,
    getListUser: getListUser,
    editUserCRUD: editUserCRUD,
    updateUserInfoCRUD: updateUserInfoCRUD,
}
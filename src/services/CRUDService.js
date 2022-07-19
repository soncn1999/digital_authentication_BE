import db from '../models/index';
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let password = await hashPassword(data.password);
            await db.User.create({
                firstName : data.firstName,
                lastName : data.lastName,
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
            if(listUser) {
               resolve(listUser); 
            } else {
                resolve([]);
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getListUser: getListUser,
}
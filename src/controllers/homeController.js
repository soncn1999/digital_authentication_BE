import CRUDService from '../services/CRUDService';
import AuthService from '../services/AuthenticationService';

let createNewUser = async (req, res) => {
    try {
        let response = await CRUDService.handleCreateNewUser(req.body);
        return res.status(200).json(response);
    } catch (errors) {
        return res.status(200).json({
            errCode: -1,
            message: errors,
        })
    }
}

let loginUser = async (req, res) => {
    try {
        console.log(req.body);
        let response = await CRUDService.handleloginUser(req.body);
        return res.status(200).json(response);
    } catch (errors) {
        return res.status(200).json({
            errCode: -1,
            message: 'Missing from server, try again',
        })
    }
}

let createSignature = async (req, res) => {
    try {
        let response = await AuthService.generateSignature(req.body);
        return res.status(200).json(response);
    } catch (errors) {
        return res.status(200).json({
            errCode: -1,
            message: 'Missing from server, try again',
        })
    }
}

let verifySignature = async (req, res) => {
    try {
        let response = await AuthService.handleVerifySignature(req.body);
        return res.status(200).json(response);
    } catch (errors) {
        return res.status(200).json({
            errCode: -1,
            message: 'Missing from server, try again',
        })
    }
}

let encryptData = async (req, res) => {
    try {
        let response = await AuthService.encryptWithPublicKey(req.body);
        return res.status(200).json(response);
    } catch (errors) {
        return res.status(200).json({
            errCode: -1,
            message: 'Missing from server, try again',
        })
    }
}

let decryptData = async (req, res) => {
    try {
        let response = await AuthService.decryptWithPrivateKey(req.body);
        return res.status(200).json(response);
    } catch (errors) {
        return res.status(200).json({
            errCode: -1,
            message: 'Missing from server, try again',
        })
    }
}

module.exports = {
    createNewUser: createNewUser,
    loginUser: loginUser,
    createSignature: createSignature,
    encryptData: encryptData,
    decryptData: decryptData,
    verifySignature: verifySignature,
};
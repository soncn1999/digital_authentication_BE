import { resolve } from 'path';
import db from '../models/index';
const crypto = require('crypto');
const buffer = require('buffer');
require('dotenv').config();

let generateSignature = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.message && data.privateKey && data.token) {
                let privateKeyObject = crypto.createPrivateKey(data.privateKey);
                let dataHash = handleHashData(data.message);
                let signData = new Buffer(dataHash);
                let sign = crypto.sign("SHA256", signData, privateKeyObject);
                let user_info = await getUserInfo('TOKEN', data.token);

                let response = await db.Auth_info.update({
                    sign: sign.toString('base64'),
                }, {
                    where: { user_id: user_info.id }
                });

                if (response) {
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: sign.toString('base64'),
                    });
                } else {
                    resolve({
                        errCode: 2,
                        message: 'Can not create signature for user',
                        data: {},
                    })
                }
            } else {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameters',
                })
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

let handleVerifySignature = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.message && data.publicKey && data.signature) {
                let isSenderPublicKey = await handleVerifyCertificate(data);
                if (isSenderPublicKey.data) {
                    let publicKeyObject = crypto.createPublicKey(data.publicKey);
                    let dataHash = handleHashData(data.message);
                    let dataSign = new Buffer(dataHash);
                    let signatureData = new Buffer(data.signature, 'base64');
                    let isVerified = crypto.verify("SHA256", dataSign, publicKeyObject, signatureData);
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: isVerified
                    });
                } else {
                    resolve({
                        errCode: 2,
                        message: 'Invalid public key, try again with a different key'
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameters',
                })
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

let encryptWithPublicKey = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.plainText && data.publicKey) {
                // let isSenderPublicKey = await handleVerifyCertificate(data);
                if (true) {
                    let publicKeyObject = crypto.createPublicKey(data.publicKey);
                    let encryptMe = crypto.publicEncrypt({
                        key: publicKeyObject,
                        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                        oaepHash: "sha256"
                    }, Buffer.from(data.plainText));
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: encryptMe.toString('base64'),
                    });
                } else {
                    resolve({
                        errCode: 2,
                        message: 'Public key is not suitable, try with other key',
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameters',
                });
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

let decryptWithPrivateKey = (data) => {
    return new Promise((resolve, reject) => {
        try {
            if (data.privateKey && data.cipherText) {
                let privateKeyObject = crypto.createPrivateKey(data.privateKey);
                let CipherTextData = new Buffer(data.cipherText, 'base64');

                let decryptData = crypto.privateDecrypt({
                    key: privateKeyObject,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha256"
                }, CipherTextData);

                if (decryptData) {
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: decryptData.toString(),
                    });
                } else {
                    resolve({
                        errCode: 0,
                        message: 'Missing decrypt data',
                    });
                }
            } else {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter',
                })
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

let handleHashData = (message) => {
    try {
        let hash = crypto.getHashes();
        let hashPwd = crypto.createHash('sha1').update(message).digest('hex');
        return hashPwd;
    } catch (errors) {
        console.log(errors);
    }
}

let getUserInfo = (type, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (type === 'TOKEN') {
                let response = await db.User.findOne({
                    where: {
                        token: data,
                    },
                    raw: true,
                });
                if (response) {
                    resolve(response);
                } else {
                    resolve({});
                }
            } else if (type === 'EMAIL') {
                let response = await db.User.findOne({
                    where: {
                        email: data,
                    },
                    raw: true,
                });
                if (response) {
                    resolve(response);
                } else {
                    resolve({});
                }
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

let handleVerifyCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.certificate && data.username && data.publicKey) {
                let getCAInfo = await getUserInfo('EMAIL', process.env.CA_NAME);
                if (getCAInfo) {
                    let CAData = await db.Auth_info.findOne({
                        where: {
                            user_id: getCAInfo.id,
                        },
                        raw: true,
                    });

                    if (CAData) {
                        let certificateData = `${getCAInfo.email} ${CAData.sign} ${data.username} ${data.publicKey}`;

                        let certificateDataHash = handleHashData(certificateData);

                        let publicKeyObject = crypto.createPublicKey(getCAInfo.public_key);

                        let certificateDataBuffer = new Buffer(certificateDataHash);
                        let certificateDataConvert = new Buffer(data.certificate, 'base64');
                        let isVerified = crypto.verify("SHA256", certificateDataBuffer, publicKeyObject, certificateDataConvert);
                        resolve({
                            errCode: 0,
                            message: 'OK',
                            data: isVerified
                        });
                    }
                }
            } else {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameters',
                });
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

module.exports = {
    generateSignature: generateSignature,
    handleVerifySignature: handleVerifySignature,
    encryptWithPublicKey: encryptWithPublicKey,
    decryptWithPrivateKey: decryptWithPrivateKey,
}
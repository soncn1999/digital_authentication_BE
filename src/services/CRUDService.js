import db from '../models/index';
import bcrypt, { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
const crypto = require('crypto');
const buffer = require('buffer');
const salt = bcrypt.genSaltSync(10);
require('dotenv').config();

let handleCreateNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.email && data.email !== process.env.CA_NAME && data.password) {
                let hashPassword = await handleHashPassword(data.password);
                let token = uuidv4();

                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 2048,
                });

                let publicKeyExport = publicKey.export({ type: 'pkcs1', format: 'pem' });
                let privateKeyExport = privateKey.export({ type: 'pkcs1', format: 'pem' });

                // const publicKeyObject = crypto.createPublicKey(publicKey.export({ type: 'pkcs1', format: 'pem' }));
                // const privateKeyObject = crypto.createPrivateKey(privateKey.export({ type: 'pkcs1', format: 'pem' }));

                const [user, created] = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        password: hashPassword,
                        organization: data.organization,
                        token: token,
                        public_key: publicKeyExport,
                    }
                });

                if (created) {
                    let userCertificate = await handleCreateCertificate({ username: data.email, publicKey: publicKeyExport });
                    let userInfo = await getUserByEmail(data.email);
                    let certificate = await db.Auth_info.create({
                        certificate: userCertificate.data,
                        user_id: userInfo.id,
                    });

                    if (certificate) {
                        resolve({
                            errCode: 0,
                            message: 'Created user successfully',
                            private_key: privateKeyExport,
                            public_key: publicKeyExport,
                            certificate: userCertificate.data,
                        })
                    } else {
                        resolve({
                            errCode: 4,
                            message: 'Can not generate certificate for user',
                        })
                    }
                } else {
                    resolve({
                        errCode: 1,
                        message: 'User already exists',
                    })
                }
            } else if (data.email && data.email === process.env.CA_NAME && data.password) {

                let hashPassword = await handleHashPassword(data.password);
                let token = uuidv4();

                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 2048,
                });

                let publicKeyExport = publicKey.export({ type: 'pkcs1', format: 'pem' });
                let privateKeyExport = privateKey.export({ type: 'pkcs1', format: 'pem' });

                const [user, created] = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        password: hashPassword,
                        organization: data.organization,
                        token: token,
                        public_key: publicKeyExport,
                    }
                });

                let dataSignature = `CA Authentication Signature developed by KMA`;
                let dataHash = handleHashData(dataSignature);
                let CASign = generateSignature(dataHash, privateKeyExport);

                let checkCASign = handleVerifySignature(dataSignature, publicKeyExport, CASign.toString('base64'));
                console.log(checkCASign);

                let findUser = await db.User.findOne({
                    where: { email: data.email },
                    raw: true,
                });

                if (created && findUser && CASign) {
                    let response = await db.Auth_info.create({
                        user_id: findUser.id,
                        privateKey: privateKeyExport,
                        sign: CASign.toString('base64'),
                    });
                    if (response) {
                        resolve({
                            errCode: 0,
                            message: 'Created CA successfully',
                            private_key: privateKeyExport,
                            public_key: publicKeyExport,
                        })
                    } else {
                        resolve({
                            errCode: 3,
                            message: 'Can not generate CA, try again',
                        })
                    }
                } else {
                    resolve({
                        errCode: 2,
                        message: 'User already exists',
                    })
                }
            } else {
                reject({
                    errCode: 1,
                    message: 'Missing required parameters',
                })
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

let generateSignature = (data, privateKey) => {
    try {
        let privateKeyObject = crypto.createPrivateKey(privateKey);
        let signData = new Buffer(data);
        let sign = crypto.sign("SHA256", signData, privateKeyObject);
        return sign;
    } catch (errors) {
        console.log(errors);
    }
}

let handleVerifySignature = (message, publicKey, signature) => {
    try {
        let signatureData = new Buffer(signature, 'base64');
        let publicKeyObject = crypto.createPublicKey(publicKey);
        let data = new Buffer(message);
        let isVerified = crypto.verify("SHA256", data, publicKeyObject, signatureData);
        return isVerified;
    } catch (errors) {
        console.log(errors);
    }
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

let handleHashPassword = (plaintPass) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hash = await bcrypt.hashSync(plaintPass, salt);
            resolve(hash);
        } catch (error) {
            reject(error);
        }
    });
}

let handleloginUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.email && data.password) {
                let response = await getUserByEmail(data.email);

                if (response) {
                    let passwordCompareResult = await bcrypt.compare(data.password, response.password);
                    delete response.password;
                    if (passwordCompareResult) {
                        resolve({
                            errCode: 0,
                            message: 'OK',
                            data: response,
                        })
                    } else {
                        resolve({
                            errCode: -2,
                            message: 'Password incorrect',
                        })
                    }
                } else {
                    resolve({
                        errCode: 2,
                        message: 'User does not exist, login failed',
                    })
                }
            } else {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameters'
                })
            }
        } catch (errors) {
            reject(errors);
        }
    });
}

let getUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await db.User.findOne({
                where: {
                    email: email,
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                raw: true,
            });
            if (response) {
                resolve(response);
            } else {
                resolve({});
            }
        } catch (errors) {
            console.log(errors);
        }
    });
}

let handleCreateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data.username && data.publicKey) {
                let getCAInfo = await getUserByEmail(process.env.CA_NAME);

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
                        let privateKeyObject = crypto.createPrivateKey(CAData.privateKey);
                        let signData = new Buffer(certificateDataHash);
                        let certificate = crypto.sign("SHA256", signData, privateKeyObject);
                        resolve({
                            errCode: 0,
                            message: 'OK',
                            data: certificate.toString('base64'),
                        });
                    } else {
                        resolve({
                            errCode: 1,
                            message: 'Can not create certificate, try again',
                        });
                    }
                }
            } else {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter',
                });
            }
        } catch (errors) {
            reject(errors);
        }
    })
}

module.exports = {
    handleCreateNewUser: handleCreateNewUser,
    handleloginUser: handleloginUser,
}
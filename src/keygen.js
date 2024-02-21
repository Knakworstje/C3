const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const fs = require('fs');

class Wallet {
    constructor(pub, priv) {
        this.publicKey = pub;
        this.privateKey = priv;
    }
}

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

fs.writeFileSync('./keypair.json', JSON.stringify(new Wallet(publicKey, privateKey)));
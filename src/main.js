const { Blockchain, Contract, Transaction } = require("./blockchain");
const { connect, emitTx, emitContract } = require('./network');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const keypair = ec.keyFromPrivate(JSON.parse(fs.readFileSync('./keypair.json')).privateKey);

const chain = new Blockchain;

module.exports.chain = chain;
module.exports.Contract = Contract;
module.exports.Transaction = Transaction;
module.exports.connect = connect;
module.exports.emitTx = emitTx;
module.exports.emitContract = emitContract;
module.exports.keypair = keypair;
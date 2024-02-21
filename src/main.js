const { Blockchain, Contract, Transaction } = require("./blockchain");
const { connect, emitTx, emitContract } = require('./network');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const keypair = ec.keyFromPrivate(JSON.parse(fs.readFileSync('./keypair.json')).privateKey);

const chain = new Blockchain;
chain.addBlock(new Block('hi'));
chain.addBlock(new Block('test'));
chain.addBlock(new Block('hello world!'));

console.log(chain.isChainValid());

chain.chain[2].transactions = 'tamepered with';

module.exports.chain = chain;
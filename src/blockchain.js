const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

function SHA256d(input) {
    return SHA256(SHA256(input));
}

class Contract {
    constructor(owner, code, gas, wallet) {
        this.owner = owner;
        this.code = code;
        this.gas = gas;
        this.wallet = wallet;
        this.type = 'contract';
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256d(this.owner + this.code + this.type + this.gas + this.wallet).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.owner) {
            console.error('You cannot sign transactions made by other wallets!');
            return;
        }

        const hashContract = this.calculateHash();
        const sig = signingKey.sign(hashContract, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (!this.signature || this.signTransaction.length === 0) {
            console.error('No signature in this transaction!');
            return false;
        }

        const publicKey = ec.keyFromPublic(this.owner, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Transaction {
    constructor(sender, recipient, amount, gas) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount; 
        this.type = 'transaction';
        this.gas = gas;      
        this.block = null;
    }

    calculateHash() {
        return SHA256d(this.sender + this.recipient + this.amount + this.type + this.gas + this.block).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.sender) {
            console.error('You cannot sign transactions made by other wallets!');
            return;
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.sender === null && this === this.block.miningReward) return true;

        if (!this.signature || this.signTransaction.length === 0) {
            console.error('No signature in this transaction!');
            return false;
        }

        const publicKey = ec.keyFromPublic(this.sender, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(transactions, previous_hash) {
        this.timestamp = Date.now();
        this.transactions = transactions;
        this.previous_hash = previous_hash;
        this.nonce = 0;
        this.miningReward = null;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256d(this.timestamp + JSON.stringify(this.transactions) + this.previous_hash + this.nonce + this.miningReward).toString();
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }

    isValid() {
        let currentMiningReward = 0;

        for (const tx of this.transactions) {
            currentMiningReward += tx.gas;
        }

        if (this.hasValidTransactions && this.miningReward === currentMiningReward) {
            return true;
        } else {
            return false;
        }
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 6;
        this.pending = [];
    }

    createGenesisBlock() {
        let newBlock = new Block(null, null);
        newBlock.hash = newBlock.calculateHash();

        return newBlock;
    }

    createContract(contract) {
        this.pending.push(contract);
    }

    createTransaction(tx) {
        this.pending.push(tx);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const item of block.transactions) {
                if (item.action === 'transaction') {
                    if (item.sender === address) {
                        balance -= item.amount;
                    }

                    if (item.recipient === address) {
                        balance += item.amount;
                    }
                }
            }
        }

        return balance;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previous_hash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                this.chain = this.chain.slice(0, i);
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                this.chain = this.chain.slice(0, i);
                return false;
            }

            if (currentBlock.previous_hash !== previousBlock.hash) {
                this.chain = this.chain.slice(0, i);
                return false;
            }
        }

        return true; 
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Contract = Contract;
module.exports.Transaction = Transaction;
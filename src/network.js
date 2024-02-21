const { chain } = require('./main');

const express = require('express');
 
const bootstrapNodes = ['3.69.240.204'];

let nodes = bootstrapNodes;

const app = express();

app.get('/addtx/:tx', (req, res) => {
    const tx = JSON.parse(req.params.tx);

    if (tx.type === 'transaction' && tx.isValid() && chain.getBalanceOfAddress(tx.sender) >= tx.amount + tx.gas) {
        chain.createTransaction(tx);
        res.sendStatus(200);   
    } else {
        res.sendStatus(403);
    }
});

app.get('/addcontract/:contract', (req, res) => {
    const contract = JSON.parse(req.params.contract);

    if (contract.type === 'owner' && contract.isValid() && chain.getBalanceOfAddress(contract.owner) >= contract.gas) {
        chain.createContract(contract);
        res.sendStatus(200);   
    } else {
        res.sendStatus(403);
    }
});

app.get('/addblock/:block', (req, res) => {
    const block = JSON.parse(req.params.block);

    if (block.isValid() && block.hash === block.calculateHash() && block.previous_hash === chain.getLatestBlock().hash) {
        chain.addBlock(block);
        res.sendStatus(200);   
    } else {
        res.sendStatus(403);
    }
});

app.get('/getchain', (req, res) => {
    res.send(chain.chain);
});

app.get('/connect', (req, res) => {
    nodes.push(req.ip);
    res.sendStatus(200);
});

app.get('/getnodes', (req, res) => {
    res.send(JSON.stringify(nodes));
});

async function discoverNodesRecursive(node) {
    const response = await fetch("http://" + node + "/getnodes");
    const nodesRecieved = await response.json();

    if (nodesRecieved === undefined || nodesRecieved === null || nodesRecieved.length === 0) {
        await connect();
    } else {
        for (const nodeRecieved of nodesRecieved) {
            if (!nodes.includes(nodeRecieved)) {
                fetch('http://' + nodes[i] + '/connect')
                .then(response => {
                    if (response.ok) {
                        nodes.push(nodeRecieved);
                        discoverNodesRecursive(nodeRecieved);
                    }
                });
            }
        }
    }
}

async function connect() {
    for (let i = 0; i < bootstrapNodes.length; i++) {
        fetch('http://' + bootstrapNodes[i] + '/connect')
        .then(response => {
            if (response.ok) {
                nodes.push(bootstrapNodes[i]);
                discoverNodesRecursive(bootstrapNodes[i]);
            }
        });
    }
}

async function emitTx(tx) {
    if (tx.type === 'transaction' && tx.isValid() && chain.getBalanceOfAddress(tx.sender) >= tx.amount + tx.gas) {
        chain.createTransaction(tx);

        for (let i = 0; i < nodes.length; i++) {
            fetch('http://' + nodes[i] + '/addtx/' + JSON.stringify(tx))
            .then(response => {
                if (!response.ok) {
                    return false;
                }
            });
        }

        return true;
    } else {
        return false;
    }
}

async function emitContract(contract) {
    if (contract.type === 'contract' && contract.isValid() && chain.getBalanceOfAddress(contract.owner) >= contract.gas) {
        chain.createContract(contract);

        for (let i = 0; i < nodes.length; i++) {
            fetch('http://' + nodes[i] + '/addcontract/' + JSON.stringify(contract))
            .then(response => {
                if (!response.ok) {
                    return false;
                }
            });
        }

        return true;
    } else {
        return false;
    }
}

module.exports.connect = connect;
module.exports.emitTx = emitTx;
module.exports.emitContract = emitContract;
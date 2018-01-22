const express = require('express');
const router = express.Router();

const nemLibrary = require("nem-library");
const AccountHttp = nemLibrary.AccountHttp;
const NEMLibrary = nemLibrary.NEMLibrary;
const NetworkTypes = nemLibrary.NetworkTypes;
const Address = nemLibrary.Address;
const Account = nemLibrary.Account;
const TransferTransaction = nemLibrary.TransferTransaction;
const TimeWindow = nemLibrary.TimeWindow;
const EmptyMessage = nemLibrary.EmptyMessage;
const MultisigTransaction = nemLibrary.MultisigTransaction;
const PublicAccount = nemLibrary.PublicAccount;
const TransactionHttp = nemLibrary.TransactionHttp;
const SignedTransaction = nemLibrary.SignedTransaction;

const MosaicId = require("nem-library/dist/src/models/mosaic/MosaicId").MosaicId;
const MosaicTransferable = require("nem-library/dist/src/models/mosaic/MosaicTransferable").MosaicTransferable;
const MosaicProperties = require("nem-library/dist/src/models/mosaic/MosaicDefinition").MosaicProperties;

// Initialize NEMLibrary for TEST_NET Network
NEMLibrary.bootstrap(NetworkTypes.TEST_NET);

const projectPrivateKey = process.env.PRIVATE_KEY;
const projetCosignerAccount = Account.createWithPrivateKey(projectPrivateKey);
const AMOUNT = 1;


// we'll create our routes here
router.post('/pick', (req,res)=>{
    console.log("body: ",req.body);
    const name=req.body.name;
    const address=req.body.address;
    const mosaicId=new MosaicId("hunter",name);
    const mosaicTransferable = new MosaicTransferable(mosaicId,new MosaicProperties(),AMOUNT);

    const transferTransaction = TransferTransaction.createWithMosaics(
        TimeWindow.createWithDeadline(),
        new Address(address),
        [mosaicTransferable],
        EmptyMessage
    );

    const transactionHttp = new TransactionHttp();

    const signedTransaction = projetCosignerAccount.signTransaction(transferTransaction);

    transactionHttp.announceTransaction(signedTransaction).subscribe( x => {
        console.log(x);
        res.send(x); 
    });
});


router.post('/exchange', (req,res)=>{
    console.log("body: ",req.body);
    const name=req.body.name;
    const privateKey=req.body.privateKey;
    const account = Account.createWithPrivateKey(privateKey);

    const mosaicId=new MosaicId("hunter",name);
    const mosaicTransferable = new MosaicTransferable(mosaicId,new MosaicProperties(),AMOUNT);

    const transferTransaction = TransferTransaction.createWithMosaics(
        TimeWindow.createWithDeadline(),
        projetCosignerAccount.address,
        [mosaicTransferable],
        EmptyMessage
    );

    const transactionHttp = new TransactionHttp();

    const signedTransaction = account.signTransaction(transferTransaction);

    transactionHttp.announceTransaction(signedTransaction).subscribe( x => {
        console.log(x);
        res.send(x); 
    });
});

module.exports = router;
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
const PlainMessage = nemLibrary.PlainMessage;
const XEM = nemLibrary.XEM;

const MosaicId = require("nem-library/dist/src/models/mosaic/MosaicId").MosaicId;
const MosaicTransferable = require("nem-library/dist/src/models/mosaic/MosaicTransferable").MosaicTransferable;
const MosaicProperties = require("nem-library/dist/src/models/mosaic/MosaicDefinition").MosaicProperties;

// Initialize NEMLibrary for TEST_NET Network
NEMLibrary.bootstrap(NetworkTypes.TEST_NET);

const projectPrivateKey = process.env.PRIVATE_KEY;
const projetCosignerAccount = Account.createWithPrivateKey(projectPrivateKey);
const AMOUNT = 1;
const MIN_XEM=process.env.MIN_XEM;
const MIN_XEM_SEND = process.env.MIN_XEM_SEND;

// we'll create our routes here
router.post('/pick', (req,res)=>{
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
    },err => {
        console.log(`Something went wrong: ${err.message}`);
        res.status(400).send({
            'error':err.message
        })
    });
});


router.post('/exchange', (req,res)=>{
    const name=req.body.name;
    const privateKey=req.body.privateKey;
    const message = req.body.message;
    const account = Account.createWithPrivateKey(privateKey);

    const accountHttp = new AccountHttp();
    accountHttp.getFromAddress(account.address).subscribe(accountInfoWithMetaData => {
        const microNemBalance =accountInfoWithMetaData.balance.balance;
        const nemBalance = microNemBalance / 1000000;
        
        if (nemBalance < MIN_XEM){

            const transferTransaction = TransferTransaction.create(
                TimeWindow.createWithDeadline(),
                account.address,
                new XEM(MIN_XEM_SEND),
                EmptyMessage
            );

            const transactionHttp = new TransactionHttp();
            const signedTransaction = projetCosignerAccount.signTransaction(transferTransaction);
            transactionHttp.announceTransaction(signedTransaction).subscribe( x => {
                console.log("EMERGENGY TRANSFER -> ",x);
                res.status(400).send({
                    'error':'FAILURE_INSUFFICIENT_ACCOUNT_BALANCE',
                    'amount_sended':MIN_XEM
                })
            },err => {
                console.log(` EMERGENGY TRANSFER -> Something went wrong: ${err.message}`);
                res.status(400).send({
                    'error':err.message
                })
            });

        }else{
            const mosaicId=new MosaicId("hunter",name);
            const mosaicTransferable = new MosaicTransferable(mosaicId,new MosaicProperties(),AMOUNT);

            const transferTransaction = TransferTransaction.createWithMosaics(
                TimeWindow.createWithDeadline(),
                projetCosignerAccount.address,
                [mosaicTransferable],
                PlainMessage.create(message)
            );

            const transactionHttp = new TransactionHttp();

            const signedTransaction = account.signTransaction(transferTransaction);

            transactionHttp.announceTransaction(signedTransaction).subscribe( x => {
                console.log(x);
                res.send(x); 
            },err => {
                console.log(`Something went wrong: ${err.message}`);
                res.status(400).send({
                    'error':err.message
                })
            });
        }
    });
});

module.exports = router;
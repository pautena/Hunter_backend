
const nemLibrary = require("nem-library");
const Account = nemLibrary.Account;
const NEMLibrary = nemLibrary.NEMLibrary;
const Address = nemLibrary.Address;
const TransferTransaction = nemLibrary.TransferTransaction;
const TimeWindow = nemLibrary.TimeWindow;
const TransactionHttp = nemLibrary.TransactionHttp;
const PlainMessage = nemLibrary.PlainMessage;
const ConfirmedTransactionListener = nemLibrary.ConfirmedTransactionListener;
const UnconfirmedTransactionListener = nemLibrary.UnconfirmedTransactionListener;
const EmptyMessage = nemLibrary.EmptyMessage;
const MosaicId = require("nem-library/dist/src/models/mosaic/MosaicId").MosaicId;
const MosaicTransferable = require("nem-library/dist/src/models/mosaic/MosaicTransferable").MosaicTransferable;
const MosaicProperties = require("nem-library/dist/src/models/mosaic/MosaicDefinition").MosaicProperties;

const projectPrivateKey = process.env.PRIVATE_KEY;
const projectCosignerAccount = Account.createWithPrivateKey(projectPrivateKey);

let confirmedTransactionListener = new ConfirmedTransactionListener().given(projectCosignerAccount.address);

confirmedTransactionListener.subscribe(x => {
    try{
        console.log("CONFIRMED");
        const recipientAddress = x.recipient.value;
        const projectAddress = projectCosignerAccount.address.plain();
        if(recipientAddress===projectAddress){
            const mosaic = x.mosaics()[0];
            const mosaicId = mosaic.mosaicId;
            const quantity = mosaic.quantity;

            const mosaicTransferable = new MosaicTransferable(mosaicId,new MosaicProperties(),quantity);

            const transferTransaction = TransferTransaction.createWithMosaics(
                TimeWindow.createWithDeadline(),
                new Address(process.env.DESTINATION_ADDRESS),
                [mosaicTransferable],
                x.message
            );

            const transactionHttp = new TransactionHttp();

            const signedTransaction = projectCosignerAccount.signTransaction(transferTransaction);
     
            transactionHttp.announceTransaction(signedTransaction).subscribe( x => {
                console.log(x);
            },err => {
                console.log(`Something went wrong: ${err.message}`);
            });

        }else{
            console.log("CONFIRMED -> pick listener");
        }
    }catch(e){
        console.error(e);
    }
}, err => {
    console.error("confirmedTransactionListener error: ",err);
});
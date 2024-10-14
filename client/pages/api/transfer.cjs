const { AptosClient, AptosAccount, HexString, TxnBuilderTypes } = require('aptos');

const TESTNET_NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
const aptosClient = new AptosClient(TESTNET_NODE_URL);

async function transferLegacyCoin(privateKeyHex, recipient, amount) {
    console.log("Recipient:", recipient);
    try {
        const amountIntUsingNumber = Number(amount);
        
        // Create AptosAccount from private key
        const privateKey = HexString.ensure(privateKeyHex).toUint8Array();
        const sender = new AptosAccount(privateKey);

        const MODULE_ADDRESS = "0x51e1de64d24251bbd3d9d96914e9cb8e79e08b3396c66c974d4b6087c0273916";
        const MODULE_NAME = "investment_contract_finallyy";
        const FUNCTION_NAME = "invest";
        const receiver_hex_address = "0x87da5a2173900dc609ff269f5209d03998796c1d2d4a4224303d846a36d9b954"   //karan wallet address
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
            type_arguments: [],
            arguments: [receiver_hex_address, amountIntUsingNumber]
        };
        
        const txnRequest = await aptosClient.generateTransaction(sender.address(), payload);
        const signedTxn = await aptosClient.signTransaction(sender, txnRequest);
        const transactionRes = await aptosClient.submitTransaction(signedTxn);
        await aptosClient.waitForTransaction(transactionRes.hash);
    
        console.log(`Invested ${amount} to ${recipient}`);
        return transactionRes.hash;
    } catch (error) {
        console.error("Error investing:", error);
        throw error;
    }
}

module.exports = transferLegacyCoin;
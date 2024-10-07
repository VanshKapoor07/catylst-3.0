// transfer.cjs
const { AptosClient, AptosAccount, HexString } = require('aptos');

const NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
const aptosClient = new AptosClient(NODE_URL);

async function transferLegacyCoin(sender, recipient, amount) {
    console.log("big tryyyyy",recipient);
    try {
    //   const client = new AptosClient(NODE_URL);
    const amountIntUsingNumber = Number(amount);
    //   const payload = {
    //     type: "entry_function_payload",
    //     //function: `${recipient}::investment_contract::investment_v2::invest`,
    //     function: '0x51e1de64d24251bbd3d9d96914e9cb8e79e08b3396c66c974d4b6087c0273916::investment_contract::investment_v2::invest',
    //     type_arguments: [],
    //     arguments: [sender, recipient, amountIntUsingNumber]
    //   };
    const MODULE_ADDRESS = "0x51e1de64d24251bbd3d9d96914e9cb8e79e08b3396c66c974d4b6087c0273916";
    const MODULE_NAME = "investment_contract_10";
    const FUNCTION_NAME = "invest";
    
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,
      type_arguments: [],
      arguments: [recipient, sender, amountIntUsingNumber]
    };
      
      
      const txnRequest = await aptosClient.generateTransaction(sender, payload);
      const signedTxn = await aptosClient.signTransaction(sender, txnRequest);
      const transactionRes = await aptosClient.submitTransaction(signedTxn);
      await client.waitForTransaction(transactionRes.hash);
  
      console.log(`Invested ${amount} to ${recipient}`);
      return transactionRes.hash;
    } catch (error) {
      console.error("Error investing:", error);
      throw error;
    }
  }
module.exports = transferLegacyCoin;
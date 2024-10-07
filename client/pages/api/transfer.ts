import { AptosClient, AptosAccount, HexString, Types } from 'aptos';

const NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
const aptosClient = new AptosClient(NODE_URL);

async function transferLegacyCoin(amount: { toString: () => any; }, privateKey: Uint8Array | undefined, toAddress: any) {
  try {
    const sender = new AptosAccount(privateKey);

    const payload = {
        type: "entry_function_payload",
        function: `${toAddress}::investment_v2::invest`,
        type_arguments: [],
        arguments: [sender.address().hex(), amount.toString()]
    };

    const rawTxn = await aptosClient.generateTransaction(sender.address(), payload);
    const signedTxn = await aptosClient.signTransaction(sender, rawTxn);
    const pendingTxn = await aptosClient.submitTransaction(signedTxn);

    await aptosClient.waitForTransaction(pendingTxn.hash);
    return pendingTxn.hash;
} catch (error) {
    console.error('Error investing:', error);
    throw error;
}
}

// export default async function handler(req, res) {
//     if (req.method === 'POST') {
//         try {
//             const { amount, privateKeyHex, contractAddress } = req.body;
//             const privateKey = HexString.ensure(privateKeyHex).toUint8Array();
//             const txHash = await transferLegacyCoin(amount, privateKey, contractAddress);
//             res.status(200).json({ success: true, txHash });
//         } catch (error) {
//             res.status(500).json({ success: false, error: error.message });
//         }
//     } else {
//         res.setHeader('Allow', ['POST']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// }

export { transferLegacyCoin };

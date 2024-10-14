import React, { useState } from 'react';

const EnterAmount: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const availableAmount: number = 512.34; // Example available amount

  const handleAmountChange = (value: string): void => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      const numericValue: number = parseFloat(value) || 0;
      setAmountUSD(numericValue * 1); // Assuming 1:1 conversion rate
    }
  };

  const handleNextClick = async (): Promise<void> => {
    setError("");
    setTxHash("");

    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Invalid amount entered');
        return;
      }
      const adjustedAmount = Math.round(numericAmount * (10 ** 8)); // Adjust for decimal precision

      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: adjustedAmount,
          // Note: In a production environment, you should not send the private key from the client.
          // Instead, use a secure authentication method and manage keys server-side.
          privateKeyHex: '0x876d73c65dc7696c6fd4c08e897e91b0c8d0ad8dbada6a40337dc24807ca2206',
          contractAddress: '0x0ee25eca6f5c8aee94b3198ee8663c3509cc0e9d5cff244f4990c86dfbd7569d'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTxHash(data.txHash);
      } else {
        setError(data.error || 'Transaction failed');
      }
    } catch (error) {
      setError('Failed to process investment');
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={handleNextClick}>Next</button>
      <div>Amount in USD: {amountUSD}</div>
      {txHash && <div>Transaction successful! Hash: {txHash}</div>}
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
    </div>
  );
};

export default EnterAmount;

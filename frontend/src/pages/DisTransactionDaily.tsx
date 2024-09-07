import React, { useEffect, useState } from 'react';
import '../styles.css'; // CSSファイルのインポート

interface OpenButtonProps {
  transactionData: any[][];
  onClose: (isButton: boolean, number: Number, index: Number) => void;
}

const TransactionDaily: React.FC<OpenButtonProps> = ({ transactionData, onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [TransactionData, setTransactionData] = useState<any[][]>([]);

  useEffect(() => {
    setTransactionData(transactionData);
  }, [transactionData]); // transactionDataが変更されたときにのみセットする

  return (
    <div>
      {TransactionData.map((transactions, index) => (
        <div key={`transaction-group-${index}`} className="transaction-container">
          <div className="transaction-header">
            <span className="transaction-date">{transactions[0].Date}</span>
          </div>
          <div className="transaction-box">
            {transactions.map((transaction) => (
              <div key={transaction.TransactionID} className="transaction-item" onDoubleClick={() => onClose(true, 2, transaction.TransactionID)}>
                <span className="transaction-category">{transaction.CategoryName}</span>
                <span className="transaction-amount">{transaction.Amount}</span>
                <span className="transaction-memo">{transaction.Memo}</span>
                <span className="transaction-assets">{transaction.AssetsName}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionDaily;
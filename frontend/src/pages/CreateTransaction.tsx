import React, { useEffect, useState } from 'react';
import '../styles.css'; // CSSファイルのインポート
import Category from './Category';

interface OpenButtonProps {
  onClose: (isButton: boolean, number: Number, index: Number) => void;
}

interface Category {
  CategoryID: number;
  CategoryName: string;
}

interface Subcategory {
  SubcategoryNo: number | undefined;
  SubcategoryID: number | undefined;
  SubcategoryName: string;
}

interface Transfer {
  Date: Date;
  Flg: number;
  Amount: number;
  Amount2: number;
  Assets: string;
  AssetsID: number;
  AssetsUpdateTime: Date;
  Assets2: string;
  Assets2ID: number;
  Assets2UpdateTime: Date;
  Memo: string;
}

interface CreateData {
  Date: Date;
  Flg: number;
  Amount: number;
  Assets: string;
  AssetsID: number;
  AssetsUpdateTime: Date;
  Category: string;
  CategoryID: number;
  CategoryUpdateTime: Date;
  Subcategory: string;
  SubcategoryID: number;
  SubcategoryUpdateTime: Date;
  Memo: string;
}

const CreateTransaction: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [isPageFlg, setPageFlg] = useState<number>(0);

  const [disUsernames, setDisUsernames] = useState<string[]>([]);

  const [discategory_p, setDisCategory_p] = useState<Category[]>([]);
  const [discategory_n, setDisCategory_n] = useState<Category[]>([]);
  const [disSubcategory_p, setDisSubcategory_p] = useState<Subcategory[][]>([]);
  const [disSubcategory_n, setDisSubcategory_n] = useState<Subcategory[][]>([]);

  const [transferData, setTransferData] = useState<Transfer>();
  const [pCreateData, setPCreateData] = useState<CreateData>();
  const [nCreateData, setNCreateData] = useState<CreateData>();

  const [disDate, setDate] = useState<Date>(new Date());
  const [disAmount, setAmount] = useState<number>(0);
  const [disAmount2, setAmount2] = useState<number>(0);
  const [disCategory, setCategory] = useState<string>("");
  const [disCategoryID, setCategoryID] = useState<number>(0);
  const [disAssets, setAssets] = useState<string>("");
  const [disAssetsID, setAssetsID] = useState<number>(0);
  const [disAssets2, setAssets2] = useState<string>("");
  const [disAssets2ID, setAssets2ID] = useState<number>(0);
  const [disSubcategory, setSubcategory] = useState<string>("");
  const [disSubcategoryID, setSubcategoryID] = useState<number>(0);
  const [SubcategoryUpdateTime, setSubcategoryUpdateTime] = useState<Date>(new Date());
  const [CategoryUpdateTime, setCategoryUpdateTime] = useState<Date>(new Date());
  const [AssetsUpdateTime, setAssetsUpdateTime] = useState<Date>(new Date());
  const [Assets2UpdateTime, setAssets2UpdateTime] = useState<Date>(new Date());
  const [disMemo, setMemo] = useState<string>("");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/gettransactionrelation', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const assetses = data.assets;
        const categoryies = data.category;

        SetAssetsData(assetses);
        SetCategoryData(categoryies);

      } catch (error) {
        if (error instanceof Error) {
          setErrorMessages(error.message);
        } else {
          setErrorMessages('予期しないエラーが発生しました。');
        }
      }
    };

    fetchData();
  }, []);

  const SetAssetsData = (assets: any) => {
    let hozUserNo = -1;
    let usernames: string[] = [];

    let index = -1;
    let assetsnames_p: string[][] = [];
    let assetsnames_n: string[][] = [];

    let CorrectVal: number;

    // ユーザ情報ごとにデータを分ける
    assets.forEach((asset: any) => {
      if (asset.Flg == 0) {
        CorrectVal = asset.Amount;
      } else {
        CorrectVal = asset.Amount * -1;
      }

      if (hozUserNo !== asset.UserNo) {
        hozUserNo = asset.UserNo;
        usernames.push(asset.UserName);
        if (asset.Flg == 0) {
          assetsnames_p.push([asset.AssetsName]);
          assetsnames_n.push([]);
        } else {
          assetsnames_p.push([]);
          assetsnames_n.push([asset.AssetsName]);
        }
        index++;
      } else {
        if (asset.Flg == 0) {
          assetsnames_p[index].push(asset.AssetsName);
        } else {
          assetsnames_n[index].push(asset.AssetsName);
        }
      }
    });

    // セット
    setDisUsernames(usernames);
  }

  const SetCategoryData = (category: any) => {
    let CategoryID = -1;
    let index = -1;
    let categoryName_p: Category[] = [];
    let categoryName_n: Category[] = [];
    let subcategoryName_p: Subcategory[][] = [];
    let subcategoryName_n: Subcategory[][] = [];

    category.forEach((cate: any) => {
      if (CategoryID !== cate.CategoryID) {
        CategoryID = cate.CategoryID;
        if (cate.Flg == 0) {
          categoryName_p.push({
            CategoryID: cate.CategoryID,
            CategoryName: cate.CategoryName
          });
          subcategoryName_p.push([{
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName
          }]);
        } else {
          categoryName_n.push({
            CategoryID: cate.CategoryID,
            CategoryName: cate.CategoryName
          });
          subcategoryName_n.push([{
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName
          }]);
        }
        index++;
      } else {
        if (cate.Flg == 0) {
          subcategoryName_p[index].push({
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName
          });
        } else {
          subcategoryName_n[index].push({
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName
          });
        }
      }
    });

    setDisSubcategory_p(subcategoryName_p);
    setDisSubcategory_n(subcategoryName_n);
    setDisCategory_p(categoryName_p);
    setDisCategory_n(categoryName_n);
  }

  const ChangeData = (index: number) => {
    const nowPage = isPageFlg;
    if (nowPage == index) {
      return;
    }
    setPageFlg(index);

    switch (nowPage) {
      case 0:
        setPCreateData({
          Date: disDate,
          Flg: nowPage,
          Amount: disAmount,
          Assets: disAssets,
          AssetsID: disAssetsID,
          AssetsUpdateTime: AssetsUpdateTime,
          Category: disCategory,
          CategoryID: disCategoryID,
          CategoryUpdateTime: CategoryUpdateTime,
          Subcategory: disSubcategory,
          SubcategoryID: disSubcategoryID,
          SubcategoryUpdateTime: SubcategoryUpdateTime,
          Memo: disMemo
        })
        break;

      case 1:
        setNCreateData({
          Date: disDate,
          Flg: nowPage,
          Amount: disAmount,
          Assets: disAssets,
          AssetsID: disAssetsID,
          AssetsUpdateTime: AssetsUpdateTime,
          Category: disCategory,
          CategoryID: disCategoryID,
          CategoryUpdateTime: CategoryUpdateTime,
          Subcategory: disSubcategory,
          SubcategoryID: disSubcategoryID,
          SubcategoryUpdateTime: SubcategoryUpdateTime,
          Memo: disMemo
        })
        break;

      case 2:
        setTransferData({
          Date: disDate,
          Flg: nowPage,
          Amount: disAmount,
          Amount2: disAmount2,
          Assets: disAssets,
          AssetsID: disAssetsID,
          AssetsUpdateTime: AssetsUpdateTime,
          Assets2: disAssets2,
          Assets2ID: disAssets2ID,
          Assets2UpdateTime: Assets2UpdateTime,
          Memo: disMemo,
        })
        break;
    }

    switch (index) {
      case 0:
        setDate(pCreateData?.Date || new Date())
        setAmount(pCreateData?.Amount || 0);
        setAssets(pCreateData?.Assets || "");
        setAssetsID(pCreateData?.AssetsID || 0);
        setAssetsUpdateTime(pCreateData?.AssetsUpdateTime || new Date());
        setCategory(pCreateData?.Category || "");
        setCategoryID(pCreateData?.CategoryID || 0);
        setCategoryUpdateTime(pCreateData?.CategoryUpdateTime || new Date());
        setSubcategory(pCreateData?.Subcategory || "");
        setSubcategoryID(pCreateData?.SubcategoryID || 0);
        setSubcategoryUpdateTime(pCreateData?.SubcategoryUpdateTime || new Date());
        setMemo(pCreateData?.Memo || "");
        break;

      case 1:
        setDate(nCreateData?.Date || new Date())
        setAmount(nCreateData?.Amount || 0);
        setAssets(nCreateData?.Assets || "");
        setAssetsID(nCreateData?.AssetsID || 0);
        setAssetsUpdateTime(nCreateData?.AssetsUpdateTime || new Date());
        setCategory(nCreateData?.Category || "");
        setCategoryID(nCreateData?.CategoryID || 0);
        setCategoryUpdateTime(nCreateData?.CategoryUpdateTime || new Date());
        setSubcategory(nCreateData?.Subcategory || "");
        setSubcategoryID(nCreateData?.SubcategoryID || 0);
        setSubcategoryUpdateTime(nCreateData?.SubcategoryUpdateTime || new Date());
        setMemo(nCreateData?.Memo || "");
        break;

      case 2:
        setDate(transferData?.Date || new Date())
        setAmount(transferData?.Amount || 0);
        setAmount2(transferData?.Amount2 || 0);
        setAssets(transferData?.Assets || "");
        setAssetsID(transferData?.AssetsID || 0);
        setAssetsUpdateTime(transferData?.AssetsUpdateTime || new Date());
        setAssets2(transferData?.Assets2 || "");
        setAssets2ID(transferData?.Assets2ID || 0);
        setAssets2UpdateTime(transferData?.Assets2UpdateTime || new Date());
        setMemo(transferData?.Memo || "");
        break;
    }

  }

  const SaveTransactionData = async () => {

    try {
      let response;
      switch (isPageFlg) {
        case 0:
          //データチェック
          response = await fetch('/api/createtransaction', {
            method: 'POST',
            body: JSON.stringify({ pCreateData }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          break;
        case 1:
          //データチェック
          response = await fetch('/api/createtransaction', {
            method: 'POST',
            body: JSON.stringify({ nCreateData }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          break;
        case 2:
          //データチェック
          response = await fetch('/api/createtransaction', {
            method: 'POST',
            body: JSON.stringify({ transferData }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          break;

      }

      if (!response) {
        setErrorMessages('エラーが');
      } else if (!response.ok) {
        console.log(response);
        setErrorMessages('予期しないエラーが発生しました。');
      }
      else {
        onClose(true, 1, 0)
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
    }
  }

  return (
    <div>
      <h1>入出金履歴入力</h1>

      <div className='Category'>
        <div>
          <div className='TransactionSwitch'>
            <span onClick={() => ChangeData(0)}>収入</span>
            <span onClick={() => ChangeData(1)}>支出</span>
            <span onClick={() => ChangeData(2)}>振替</span>
          </div>

          {isPageFlg !== 2 && (
            <>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>日付</span>
                <input></input>
              </div>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>金額</span>
                <input></input>
              </div>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>カテゴリ</span>
                <span>{disCategory}</span>
                <span>{disSubcategory}</span>
              </div>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>資産</span>
                <span>{disAssets}</span>
              </div>
            </>)}

          {isPageFlg === 2 && (
            <>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>日付</span>
                <input></input>
              </div>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>金額</span>
                <input></input>
              </div>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>手数料</span>
                <input></input>
              </div>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>振替元</span>
                <span>{disAssets}</span>
              </div>
              <div className='TransactionGroup'>
                <span className='TransactionLabel'>振替先</span>
                <span>{disAssets2}</span>
              </div>
            </>)}
        </div>

        <div className='TransactionMemo'>
          <div className='TransactionMemoLabel'></div>
          <textarea />
        </div>
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveTransactionData()} className='btn-style'>登録</button>
        <button onClick={() => onClose(false, 1, 0)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default CreateTransaction;
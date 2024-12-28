import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート
import Category from '../Category/Category';
import AssetsModal from './AssetsModal';
import CategoryModal from './CategoryModal';

interface OpenButtonProps {
  onClose: (isButton: boolean, number: Number) => void;
}

interface Category {
  CategoryID: number;
  CategoryName: string;
  UpdateTime: Date;
}

interface Assets {
  AssetsID: number;
  UserID: number;
  UserName: string
  AssetsName: string;
  UpdateTime: Date;
}

interface Subcategory {
  SubcategoryNo: number | undefined;
  SubcategoryID: number | undefined;
  SubcategoryName: string;
  UpdateTime: Date;
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

  const [discategory_p, setDisCategory_p] = useState<Category[]>([]);
  const [discategory_n, setDisCategory_n] = useState<Category[]>([]);
  const [disAssets_p, setDisAssets_p] = useState<Assets[][]>([]);
  const [disAssets_n, setDisAssets_n] = useState<Assets[][]>([]);
  const [disSubcategory_p, setDisSubcategory_p] = useState<Subcategory[][]>([]);
  const [disSubcategory_n, setDisSubcategory_n] = useState<Subcategory[][]>([]);

  const [transferData, setTransferData] = useState<Transfer>();
  const [pCreateData, setPCreateData] = useState<CreateData>();
  const [nCreateData, setNCreateData] = useState<CreateData>();

  const [date, setDate] = useState<string>('');
  const [disDate, setDisDate] = useState<Date>(new Date());
  const [disAmount, setAmount] = useState<number>(0);
  const [dispAmount, setDisAmount] = useState<string>("0");
  const [disAmount2, setAmount2] = useState<number>(0);
  const [dispAmount2, setDisAmount2] = useState<string>("0");
  const [disCategory, setCategory] = useState<string>("未選択");
  const [disCategoryID, setCategoryID] = useState<number>(0);
  const [disAssets, setAssets] = useState<string>("未選択");
  const [disAssetsID, setAssetsID] = useState<number>(0);
  const [disAssets2, setAssets2] = useState<string>("未選択");
  const [disAssets2ID, setAssets2ID] = useState<number>(0);
  const [disSubcategory, setSubcategory] = useState<string>("未選択");
  const [disSubcategoryID, setSubcategoryID] = useState<number>(0);
  const [SubcategoryUpdateTime, setSubcategoryUpdateTime] = useState<Date>(new Date());
  const [CategoryUpdateTime, setCategoryUpdateTime] = useState<Date>(new Date());
  const [AssetsUpdateTime, setAssetsUpdateTime] = useState<Date>(new Date());
  const [Assets2UpdateTime, setAssets2UpdateTime] = useState<Date>(new Date());
  const [disMemo, setMemo] = useState<string>("");

  const [isCategoryOpen, setisCategoryOpen] = useState<boolean>(false);
  const [isCategoryID, setisCategoryID] = useState<number>(0);
  const [isSubcategoryID, setisSubcategoryID] = useState<number>(0);
  const [isAssetsOpen, setisAssetsOpen] = useState<boolean>(false);
  const [isAssets, setisAssets] = useState<boolean>(false);
  const [isAssetsID, setisAssetsID] = useState<number>(0);



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

  const SetAssetsData = (assets: any) => {
    let hozUserNo = -1;
    let usernames: string[] = [];

    let index = -1;
    let assetsnames_p: Assets[][] = [];
    let assetsnames_n: Assets[][] = [];

    // ユーザ情報ごとにデータを分ける
    assets.forEach((asset: any) => {
      if (hozUserNo !== asset.UserNo) {
        hozUserNo = asset.UserNo;
        usernames.push(asset.UserName);
        if (asset.Flg == 0) {
          assetsnames_p.push([{
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          }]);
          assetsnames_n.push([]);
        } else {
          assetsnames_p.push([]);
          assetsnames_n.push([{
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          }]);
        }
        index++;
      } else {
        if (asset.Flg == 0) {
          assetsnames_p[index].push({
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          });
        } else {
          assetsnames_n[index].push({
            UserID: asset.UserID,
            UserName: asset.UserName,
            AssetsID: asset.AssetsID,
            AssetsName: asset.AssetsName,
            UpdateTime: asset.UpdateTime,
          });
        }
      }
    });

    // セット
    setDisAssets_p(assetsnames_p);
    setDisAssets_n(assetsnames_n);

    setPCreateData({
      Date: disDate,
      Flg: 0,
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

    setNCreateData({
      Date: disDate,
      Flg: 0,
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

    setTransferData({
      Date: disDate,
      Flg: 2,
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
            CategoryName: cate.CategoryName,
            UpdateTime: cate.UpdateTime
          });
          subcategoryName_p.push([{
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName,
            UpdateTime: cate.UpdateTime
          }]);
        } else {
          categoryName_n.push({
            CategoryID: cate.CategoryID,
            CategoryName: cate.CategoryName,
            UpdateTime: cate.UpdateTime
          });
          subcategoryName_n.push([{
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName,
            UpdateTime: cate.UpdateTime
          }]);
        }
        index++;
      } else {
        if (cate.Flg == 0) {
          subcategoryName_p[index].push({
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName,
            UpdateTime: cate.UpdateTime
          });
        } else {
          subcategoryName_n[index].push({
            SubcategoryNo: cate.SubcategoryName,
            SubcategoryID: cate.SubcategoryName,
            SubcategoryName: cate.SubcategoryName,
            UpdateTime: cate.UpdateTime
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
        setDisDate(pCreateData?.Date || new Date())
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
        setDisDate(nCreateData?.Date || new Date())
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
        setDisDate(transferData?.Date || new Date())
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
          setPCreateData({
            Date: disDate,
            Flg: isPageFlg,
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
          setNCreateData({
            Date: disDate,
            Flg: isPageFlg,
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
          setTransferData({
            Date: disDate,
            Flg: isPageFlg,
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
        onClose(true, 0)
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

  const ChangeDate = (date: string) => {

    setDate(date);
    setDisDate(new Date(date));
  }

  // モーダルを閉じる処理と、選択された値の保持
  const handleCategoryValue = (category: any, subcategory: any) => {
    if (category === null && subcategory === null) {
      fetchData()
      return
    }
    else if (!(category === undefined && subcategory === undefined)) {

      setCategoryID(category?.CategoryID);
      setCategory(category?.CategoryName);
      setCategoryUpdateTime(category?.CategoryUpdateTime);

      if (subcategory?.SubcategoryID === "") {
        setSubcategoryID(-1);
      } else {
        setSubcategoryID(subcategory?.SubcategoryID);
      }

      setSubcategory(subcategory?.SubcategoryName);
      setSubcategoryUpdateTime(subcategory?.SubcategoryUpdateTime);
    }

    setisCategoryOpen(false); // モーダルを閉じる
  };

  // モーダルを閉じる処理と、選択された値の保持
  const handleAssetsValue = (value: any) => {
    if (value === null) {
      fetchData()
      return
    } else if (value !== undefined) {
      if (value.Flg == 0) {
        setAssetsID(value?.AssetsID);
        setAssets(value?.AssetsName);
        setAssetsUpdateTime(value?.AssetsUpdateTime);
      } else {
        setAssets2ID(value?.AssetsID);
        setAssets2(value?.AssetsName);
        setAssets2UpdateTime(value?.AssetsUpdateTime);
      }
    }
    setisAssetsOpen(false); // モーダルを閉じる
  };

  // モーダルを開く処理
  const handleOpenCategory = () => {
    setisCategoryID(disCategoryID);
    setisSubcategoryID(disSubcategoryID);
    setisCategoryOpen(true);
  };

  // モーダルを開く処理
  const handleOpenAssets = (flg: boolean) => {
    setisAssets(flg);
    if (flg) {
      setisAssetsID(disAssets2ID);
    } else {
      setisAssetsID(disAssetsID);
    }
    setisAssetsOpen(true);
  };


  const NumberCheck1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // 数字のみを抽出（非数字を削除）
    inputValue = inputValue.replace(/[^0-9]/g, "");

    // 先頭のゼロを削除
    if (inputValue.startsWith("0")) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    // カンマ区切りに変換
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    setAmount(parseInt(inputValue))
    setDisAmount(formattedValue);
  };
  const NumberCheck2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // 数字のみを抽出（非数字を削除）
    inputValue = inputValue.replace(/[^0-9]/g, "");

    // 先頭のゼロを削除
    if (inputValue.startsWith("0")) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    // カンマ区切りに変換
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    setAmount2(parseInt(inputValue))
    setDisAmount2(formattedValue);
  };

  const FrontZeroDel = () => {
    // フォーカスを外したときに空の場合はゼロにする（オプション）
    if (dispAmount === "") {
      setDisAmount("0");
    }
    if (dispAmount2 === "") {
      setDisAmount2("0");
    }
  };


  return (
    <div className='TransactionPopUp'>
      <h1>入出金履歴入力</h1>

      <div className='Category'>
        <div>
          <div className='TagSwitcher'>
            <button onClick={() => ChangeData(0)} className={isPageFlg == 0 ? 'active' : ''}>収入</button>
            <button onClick={() => ChangeData(1)} className={isPageFlg == 1 ? 'active' : ''}>支出</button>
            <button onClick={() => ChangeData(2)} className={isPageFlg == 2 ? 'active' : ''}>振替</button>
          </div>
          <div>
            <div className='TransactionGroup'>
              <span className='TransactionLabel'>日付</span>
              <input
                className='TransactionValue'
                type="date"
                value={date}
                onChange={(e) => ChangeDate(e.target.value.toString())}
              />
            </div>

            {isPageFlg !== 2 && (
              <>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>金額</span>
                  <input
                    type="text"
                    value={dispAmount}
                    onChange={NumberCheck1}
                    onBlur={FrontZeroDel}
                    className='TransactionValue'
                  />
                </div>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>カテゴリ</span>
                  <div className='TransactionValueSelect' onClick={() => handleOpenCategory()} >
                    <span className='TransactionSelectspan'>{disCategory}</span>
                    <span className='TransactionSelectspan'>{disSubcategory}</span>
                  </div>
                </div>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>資産</span>
                  <div className='TransactionValueSelect' onClick={() => handleOpenAssets(false)}>
                    <span className='TransactionSelectspan'>{disAssets}</span>
                  </div>
                </div>
              </>)}

            {isPageFlg === 2 && (
              <>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>金額</span>
                  <input
                    className='TransactionValue'
                    type="number"
                    value={disAmount}
                    onChange={(e) => setAmount(parseInt(e.target.value))}
                  />
                </div>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>手数料</span>
                  <input
                    type="text"
                    value={dispAmount2}
                    onChange={NumberCheck2}
                    onBlur={FrontZeroDel}
                    className='TransactionValue'
                  />
                </div>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>振替元</span>
                  <div className='TransactionValueSelect' onClick={() => handleOpenAssets(false)}>
                    <span className='TransactionSelectspan'>{disAssets}</span>
                  </div>
                </div>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>振替先</span>
                  <div className='TransactionValueSelect' onClick={() => handleOpenAssets(false)}>
                    <span className='TransactionSelectspan'>{disAssets2}</span>
                  </div>
                </div>
              </>)}
          </div>
        </div>

        <div className='TransactionMemoLabel'>
          <textarea className='TransactionMemo' />
        </div>
      </div>

      <div>
        {/* モーダル表示 */}
        {isAssetsOpen && (
          <>
            <AssetsModal
              flg={isAssets}
              assetsID={isAssetsID}
              disAssets_p={disAssets_p}
              disAssets_n={disAssets_n}
              onSelect={(value) => handleAssetsValue(value)}
            />
          </>
        )}
        {isCategoryOpen && (
          <>
            <CategoryModal
              isPageFlg={isPageFlg}
              isCategoryID={isCategoryID}
              isSubcategoryID={isSubcategoryID}
              disSubcategory_n={disSubcategory_n}
              disSubcategory_p={disSubcategory_p}
              disCategory_n={discategory_n}
              disCategory_p={discategory_p}
              onSelect={handleCategoryValue}
            />
          </>
        )}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveTransactionData()} className='btn-style'>登録</button>
        <button onClick={() => onClose(false, 0)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default CreateTransaction;
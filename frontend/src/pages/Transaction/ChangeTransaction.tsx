import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート
import AssetsModal from '../Modal/AssetsModal';
import CategoryModal from '../Modal/CategoryModal';
import { toDate } from 'date-fns';

interface OpenButtonProps {
  onClose: (isButton: boolean, number: number, move:any) => void;
  transactionID: number
}

interface Category {
  CategoryID: number;
  CategoryName: string;
  UpdateTime: Date;
}

interface Assets {
  AssetsID: number;
  UserNo: number;
  UserName: string
  Tag: string;
  AssetsName: string;
  Amount: string;
  UpdateTime: Date;
}

interface Subcategory {
  SubcategoryNo: number | undefined;
  SubcategoryID: number | undefined;
  SubcategoryName: string;
  UpdateTime: Date;
}

interface Transfer {
  Amount2: number;
  Assets: string;
  AssetsID: number;
  AssetsUpdateTime: Date;
  Assets2: string;
  Assets2ID: number;
  Assets2UpdateTime: Date;
}

interface CreateData {
  Assets: string;
  AssetsID: number;
  AssetsUpdateTime: Date;
  Category: string;
  CategoryID: number;
  CategoryUpdateTime: Date;
  Subcategory: string;
  SubcategoryID: number;
  SubcategoryUpdateTime: Date;
}

const CreateTransaction: React.FC<OpenButtonProps> = ({ onClose, transactionID }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');
  const [isPageFlg, setPageFlg] = useState<number>(0);
  const [beforePageFlg, setBeforePageFlg] = useState<number>(0);

  const [transactionInfomationID, settransactionInfomationID] = useState<number>(0);
  const [transactionInfomationID2, settransactionInfomationID2] = useState<number>(0);

  const [discategory_p, setDisCategory_p] = useState<Category[]>([]);
  const [discategory_n, setDisCategory_n] = useState<Category[]>([]);
  const [disAssets_p, setDisAssets_p] = useState<Assets[][]>([]);
  const [disAssets_n, setDisAssets_n] = useState<Assets[][]>([]);
  const [disNotAssets_n, setDisNotAssets_n] = useState<Assets[][]>([]);
  const [disNotAssets_p, setDisNotAssets_p] = useState<Assets[][]>([]);
  const [disSubcategory_p, setDisSubcategory_p] = useState<Subcategory[][]>([]);
  const [disSubcategory_n, setDisSubcategory_n] = useState<Subcategory[][]>([]);

  const [transferData, setTransferData] = useState<Transfer>();
  const [pCreateData, setPCreateData] = useState<CreateData>();
  const [nCreateData, setNCreateData] = useState<CreateData>();

  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
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
        const response = await fetch('/api/gettransaction?transactionID=' + transactionID, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        
        const assetses = data.assets;
        const categoryies = data.category;
        const transaction = data.transaction;

        SetAssetsData(assetses);
        SetCategoryData(categoryies);
        SetTransactionData(transaction, assetses, categoryies);

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
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
    }
  };

  const SetAssetsData = (assets: any) => {
    let hozUserNo = -1;
    const usernames: string[] = [];

    let index = -1;
    const assetsnames_p: Assets[][] = [];
    const assetsnames_n: Assets[][] = [];
    const not_assetsnames_p: Assets[][] = [];
    const not_assetsnames_n: Assets[][] = [];

    // ユーザ情報ごとにデータを分ける
    assets.forEach((asset: any) => {
      if (hozUserNo !== asset.UserNo) {
        hozUserNo = asset.UserNo;
        usernames.push(asset.UserName);
        if(!asset.Excluded){
          if (asset.Flg == 0) {
            assetsnames_p.push([{
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            }]);
            assetsnames_n.push([]);
            not_assetsnames_p.push([]);
            not_assetsnames_n.push([]);
          } else {
            assetsnames_p.push([]);
            assetsnames_n.push([{
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            }]);
            not_assetsnames_p.push([]);
            not_assetsnames_n.push([]);
          }
        }else{
          if (asset.Flg == 0) {
            assetsnames_p.push([]);
            assetsnames_n.push([]);
            not_assetsnames_p.push([{
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            }]);
            not_assetsnames_n.push([]);
          } else {
            assetsnames_p.push([]);
            assetsnames_n.push([]);
            not_assetsnames_p.push([]);
            not_assetsnames_n.push([{
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            }]);
          }
        }
        index++;
      } else {
        if(!asset.Excluded){
          if (asset.Flg == 0) {
            assetsnames_p[index].push({
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            });
          } else {
            assetsnames_n[index].push({
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            });
          }
        }else{
          if (asset.Flg == 0) {
            not_assetsnames_p[index].push({
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            });
          } else {
            not_assetsnames_n[index].push({
              UserNo: asset.UserNo,
              UserName: asset.UserName,
              AssetsID: asset.AssetsID,
              Tag: asset.Tag,
              AssetsName: asset.AssetsName,
              Amount: asset.Amount.toLocaleString(),
              UpdateTime: asset.UpdateTime,
            });
          }
        }
      }
    });

    // セット
    setDisAssets_p(assetsnames_p);
    setDisAssets_n(assetsnames_n);
    setDisNotAssets_p(not_assetsnames_p);
    setDisNotAssets_n(not_assetsnames_n);

    setPCreateData({
      Assets: disAssets,
      AssetsID: disAssetsID,
      AssetsUpdateTime: AssetsUpdateTime,
      Category: disCategory,
      CategoryID: disCategoryID,
      CategoryUpdateTime: CategoryUpdateTime,
      Subcategory: disSubcategory,
      SubcategoryID: disSubcategoryID,
      SubcategoryUpdateTime: SubcategoryUpdateTime
    })

    setNCreateData({
      Assets: disAssets,
      AssetsID: disAssetsID,
      AssetsUpdateTime: AssetsUpdateTime,
      Category: disCategory,
      CategoryID: disCategoryID,
      CategoryUpdateTime: CategoryUpdateTime,
      Subcategory: disSubcategory,
      SubcategoryID: disSubcategoryID,
      SubcategoryUpdateTime: SubcategoryUpdateTime
    })

    setTransferData({
      Amount2: disAmount2,
      Assets: disAssets,
      AssetsID: disAssetsID,
      AssetsUpdateTime: AssetsUpdateTime,
      Assets2: disAssets2,
      Assets2ID: disAssets2ID,
      Assets2UpdateTime: Assets2UpdateTime
    })
  }

  const SetCategoryData = (category: any) => {
    let CategoryID = -1;
    let pindex = -1;
    let nindex = -1;
    const categoryName_p: Category[] = [];
    const categoryName_n: Category[] = [];
    const subcategoryName_p: Subcategory[][] = [];
    const subcategoryName_n: Subcategory[][] = [];

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
            SubcategoryNo: cate.SubcategoryNo,
            SubcategoryID: cate.SubcategoryID,
            SubcategoryName: cate.SubcategoryName,
            UpdateTime: cate.UpdateTime
          }]);
          pindex++;
        } else {
          categoryName_n.push({
            CategoryID: cate.CategoryID,
            CategoryName: cate.CategoryName,
            UpdateTime: cate.UpdateTime
          });
          //if(cate.SubcategoryName !== ""){
            subcategoryName_n.push([{
              SubcategoryNo: cate.SubcategoryNo,
              SubcategoryID: cate.SubcategoryID,
              SubcategoryName: cate.SubcategoryName,
              UpdateTime: cate.UpdateTime
            }]);
          //}
          nindex++;
        }
      } else {
        if (cate.Flg == 0) {
          subcategoryName_p[pindex].push({
            SubcategoryNo: cate.SubcategoryNo,
            SubcategoryID: cate.SubcategoryID,
            SubcategoryName: cate.SubcategoryName,
            UpdateTime: cate.UpdateTime
          });
        } else {
          //if(cate.SubcategoryName !== ""){
          subcategoryName_n[nindex].push({
            SubcategoryNo: cate.SubcategoryNo,
            SubcategoryID: cate.SubcategoryID,
            SubcategoryName: cate.SubcategoryName,
            UpdateTime: cate.UpdateTime
          });
          //}
        }
      }
    });
  
    setDisSubcategory_p(subcategoryName_p);
    setDisSubcategory_n(subcategoryName_n);
    setDisCategory_p(categoryName_p);
    setDisCategory_n(categoryName_n);
  }

  const SetTransactionData = (transaction:any[], assets:any[], categoryies:any[]) => {
    setBeforePageFlg(transaction[0].Kind)
    settransactionInfomationID(transaction[0].TransactionInfomationID)
    setPageFlg(transaction[0].Kind)
    setDisDate(new Date(transaction[0].Date) || new Date())

    // 日付と時刻を取得
    const date = transaction[0].Date.split("T")[0]; // "2025-01-15"
    const time = transaction[0].Date.split("T")[1].replace("Z", ""); // "00:00:00"
    setDate(date)
    setTime(time)

    if (transaction[0].Kind !== 2){
      NumberCheck1(String(transaction[0].Amount) || "0")
      setMemo(transaction[0].Memo || "");
      
      SearchAssets(transaction[0].AssetsID, assets, true)
      SearchCategory(transaction[0].CategoryID, transaction[0].SubcategoryID, categoryies)
    }else{
      settransactionInfomationID2(transaction[1].TransactionInfomationID)
      NumberCheck1(String(transaction[0].Amount) || "0")
      NumberCheck2(String(transaction[1].Amount) || "0")
      setMemo(transaction[0].Memo || "");

      SearchAssets(transaction[0].AssetsID, assets, true)
      SearchAssets(transaction[1].AssetsID, assets, false)
    }
  } 

  const SearchAssets = (assetID:number, assets:any[], flg:boolean) =>{
      
    assets.forEach((asset: any) => {
      if(assetID === Number(asset.AssetsID)){
        if(flg){
          setAssets(asset.AssetsName || "");
          setAssetsID(asset.AssetsID || 0);
          setAssetsUpdateTime(asset.UpdateTime || new Date());
        }else{
          setAssets2(asset.AssetsName || "");
          setAssets2ID(asset.AssetsID || 0);
          setAssets2UpdateTime(asset.UpdateTime || new Date());
        }
      }
    })
  }

  const SearchCategory = (categoryID:number, subcategoryID:number, categorys:any[]) =>{
    categorys.forEach((category: any) => {
      if(subcategoryID === 0 && categoryID === category.CategoryID){
        setCategory(category.CategoryName || "");
        setCategoryID(category.CategoryID || 0);
        setCategoryUpdateTime(category.UpdateTime || new Date());
        setSubcategory("");
      }else if(subcategoryID === category.SubcategoryID){
        setCategory(category.CategoryName || "");
        setCategoryID(category.CategoryID || 0);
        setCategoryUpdateTime(category.UpdateTime || new Date());
        setSubcategory(category.SubcategoryName || "");
        setSubcategoryID(category.SubcategoryID || 0);
        setSubcategoryUpdateTime(category.UpdateTime || new Date());
      }
    })
  }

  const ChangeData = (index: number) => {
    const nowPage = isPageFlg;
    if (nowPage == index) {
      return;
    }
    setPageFlg(index);

    SetNowDataTable(nowPage)
    SetNowData(index)
    
  }

  const SetNowDataTable = (PageIndex:number) => {
    switch (PageIndex) {
      case 0:
        setPCreateData({
          Assets: disAssets,
          AssetsID: disAssetsID,
          AssetsUpdateTime: AssetsUpdateTime,
          Category: disCategory,
          CategoryID: disCategoryID,
          CategoryUpdateTime: CategoryUpdateTime,
          Subcategory: disSubcategory,
          SubcategoryID: disSubcategoryID,
          SubcategoryUpdateTime: SubcategoryUpdateTime
        })
        break;

      case 1:
        setNCreateData({
          Assets: disAssets,
          AssetsID: disAssetsID,
          AssetsUpdateTime: AssetsUpdateTime,
          Category: disCategory,
          CategoryID: disCategoryID,
          CategoryUpdateTime: CategoryUpdateTime,
          Subcategory: disSubcategory,
          SubcategoryID: disSubcategoryID,
          SubcategoryUpdateTime: SubcategoryUpdateTime
        })
        break;

      case 2:
        setTransferData({
          Amount2: disAmount2,
          Assets: disAssets,
          AssetsID: disAssetsID,
          AssetsUpdateTime: AssetsUpdateTime,
          Assets2: disAssets2,
          Assets2ID: disAssets2ID,
          Assets2UpdateTime: Assets2UpdateTime
        })
        break;
    }
  }

  const SetNowData = (PageIndex:number) => {
    switch (PageIndex) {
      case 0:
        setAssets(pCreateData?.Assets || "");
        setAssetsID(pCreateData?.AssetsID || 0);
        setAssetsUpdateTime(pCreateData?.AssetsUpdateTime || new Date());
        setCategory(pCreateData?.Category || "");
        setCategoryID(pCreateData?.CategoryID || 0);
        setCategoryUpdateTime(pCreateData?.CategoryUpdateTime || new Date());
        setSubcategory(pCreateData?.Subcategory || "");
        setSubcategoryID(pCreateData?.SubcategoryID || 0);
        setSubcategoryUpdateTime(pCreateData?.SubcategoryUpdateTime || new Date());
        break;

      case 1:
        setAssets(nCreateData?.Assets || "");
        setAssetsID(nCreateData?.AssetsID || 0);
        setAssetsUpdateTime(nCreateData?.AssetsUpdateTime || new Date());
        setCategory(nCreateData?.Category || "");
        setCategoryID(nCreateData?.CategoryID || 0);
        setCategoryUpdateTime(nCreateData?.CategoryUpdateTime || new Date());
        setSubcategory(nCreateData?.Subcategory || "");
        setSubcategoryID(nCreateData?.SubcategoryID || 0);
        setSubcategoryUpdateTime(nCreateData?.SubcategoryUpdateTime || new Date());
        break;

      case 2:
        setAmount2(0);
        setAssets(transferData?.Assets || "");
        setAssetsID(transferData?.AssetsID || 0);
        setAssetsUpdateTime(transferData?.AssetsUpdateTime || new Date());
        setAssets2(transferData?.Assets2 || "");
        setAssets2ID(transferData?.Assets2ID || 0);
        setAssets2UpdateTime(transferData?.Assets2UpdateTime || new Date());
        break;
    }
  }

  const SaveTransactionData = async () => {
    SetNowData(isPageFlg)
    try {
      let response;
      switch (isPageFlg) {
        case 0:
          //データチェック
          setPCreateData({
            Assets: disAssets,
            AssetsID: disAssetsID,
            AssetsUpdateTime: AssetsUpdateTime,
            Category: disCategory,
            CategoryID: disCategoryID,
            CategoryUpdateTime: CategoryUpdateTime,
            Subcategory: disSubcategory,
            SubcategoryID: disSubcategoryID,
            SubcategoryUpdateTime: SubcategoryUpdateTime
          })

          response = await fetch('/api/changetransaction', {
            method: 'POST',
            body: JSON.stringify({ Date: disDate,
            BeforeFlg: beforePageFlg,
            TransactionID: transactionID,
            TransactionInfomationID:transactionInfomationID,
            TransactionInfomationID2:transactionInfomationID2,
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
            Memo: disMemo }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          break;
        case 1:
          //データチェック
          setNCreateData({
            Assets: disAssets,
            AssetsID: disAssetsID,
            AssetsUpdateTime: AssetsUpdateTime,
            Category: disCategory,
            CategoryID: disCategoryID,
            CategoryUpdateTime: CategoryUpdateTime,
            Subcategory: disSubcategory,
            SubcategoryID: disSubcategoryID,
            SubcategoryUpdateTime: SubcategoryUpdateTime
          })

          response = await fetch('/api/changetransaction', {
            method: 'POST',
            body: JSON.stringify({ Date: disDate,
              BeforeFlg: beforePageFlg,
              TransactionID: transactionID,
              TransactionInfomationID:transactionInfomationID,
              TransactionInfomationID2:transactionInfomationID2,
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
              Memo: disMemo }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          break;
        case 2:
          //データチェック  
          setTransferData({
            Amount2: disAmount2,
            Assets: disAssets,
            AssetsID: disAssetsID,
            AssetsUpdateTime: AssetsUpdateTime,
            Assets2: disAssets2,
            Assets2ID: disAssets2ID,
            Assets2UpdateTime: Assets2UpdateTime
          })

          response = await fetch('/api/changetransaction', {
            method: 'POST',
            body: JSON.stringify({ Date: disDate,
              BeforeFlg: beforePageFlg,
              Flg: isPageFlg,
              TransactionID: transactionID,
              TransactionInfomationID:transactionInfomationID,
              TransactionInfomationID2:transactionInfomationID2,
              Amount: disAmount,
              Amount2: disAmount2,
              Assets: disAssets,
              AssetsID: disAssetsID,
              AssetsUpdateTime: AssetsUpdateTime,
              Assets2: disAssets2,
              Assets2ID: disAssets2ID,
              Assets2UpdateTime: Assets2UpdateTime,
              Memo: disMemo }),
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
        onClose(true, 0, null)
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

  const CopyTransactionData = async () => {
    SetNowData(isPageFlg)
    const move:any = {};
    
    move.moveKind = isPageFlg
    move.moveAmount = disAmount
    move.moveAssetsID = disAssetsID
    move.moveMemo = disMemo
    //時間だけ持ち込む
    move.moveDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), disDate.getHours() - 9, disDate.getMinutes(), disDate.getSeconds())

    switch (isPageFlg) {
      case 0 || 1:
        move.moveCategoryID = disCategoryID
        move.moveSubcategoryID = disSubcategoryID
        break;
      case 2:
        move.moveAmount2 = disAmount2
        move.moveAssets2ID = disAssets2ID
        break;
    }
    onClose(false, 1, move)
  }

  const DeleteTransactionData = async () => {
    try {
      let response;
      response = await fetch('/api/deletetransaction', {
        method: 'POST',
        body: JSON.stringify({ TransactionID: transactionID}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response) {
        setErrorMessages('エラーが');
      } else if (!response.ok) {
        console.log(response);
        setErrorMessages('予期しないエラーが発生しました。');
      }
      else {
        onClose(true, 0, null)
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
    setDisDate(new Date(date + "T" + time + "Z"));
  }

  const ChangeTime = (time: string) => {
    setTime(time);
    setDisDate(new Date(date + "T" + time + "Z"));
  }

  // モーダルを閉じる処理と、選択された値の保持
  const handleCategoryValue = (category: any, subcategory: any) => {
    if (category === null && subcategory === null) {
      setCategoryID(0)
      setCategory("未選択")

      setSubcategoryID(0)
      setSubcategory("未選択");

      fetchData()
    }
    else if (!(category === undefined && subcategory === undefined)) {

      setCategoryID(category?.CategoryID);
      setCategory(category?.CategoryName);
      setCategoryUpdateTime(category?.UpdateTime);

      if(subcategory === null){
        setSubcategoryID(0);
      }else if (subcategory?.SubcategoryID === "") {
        setSubcategoryID(0);
      } else {
        setSubcategoryID(subcategory?.SubcategoryID);
      }

      setSubcategory(subcategory?.SubcategoryName);
      setSubcategoryUpdateTime(subcategory?.UpdateTime);
    }

    setisCategoryOpen(false); // モーダルを閉じる
  };

  // モーダルを閉じる処理と、選択された値の保持
  const handleAssetsValue = (value: any) => {
    if (value === undefined) {
      fetchData()
    } else if(value === false) {
      setAssetsID(0)
      setAssets("未選択")
    }else if(value === true){
      setAssets2ID(0)
      setAssets2("未選択")
    }else {
      console.log(value)
      if (value.Flg == 0) {
        setAssetsID(value?.AssetsID);
        setAssets(value?.AssetsName);
        setAssetsUpdateTime(value?.UpdateTime);
      } else {
        setAssets2ID(value?.AssetsID);
        setAssets2(value?.AssetsName);
        setAssets2UpdateTime(value?.UpdateTime);
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


  const NumberCheck1 = (e: string) => {
    let inputValue = e;

    // **全角数字を半角に変換**
    inputValue = inputValue.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

    // **数字のみを抽出（非数字を削除）**
    inputValue = inputValue.replace(/[^0-9]/g, "");

    // **先頭のゼロを削除**
    if (inputValue.startsWith("0")) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    // **カンマ区切りに変換**
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    if (inputValue === "") {
      inputValue = "0";
    }
    setAmount(parseInt(inputValue));
    setDisAmount(formattedValue);
  };

  const NumberCheck2 = (e: string) => {
    let inputValue = e;

    // **全角数字を半角に変換**
    inputValue = inputValue.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

    // **数字のみを抽出（非数字を削除）**
    inputValue = inputValue.replace(/[^0-9]/g, "");

    // **先頭のゼロを削除**
    if (inputValue.startsWith("0")) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    // **カンマ区切りに変換**
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (inputValue === "") {
      inputValue = "0";
    }
    
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
      <h1>入出金履歴更新</h1>

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
              <input
                className='TransactionValue'
                type="time"
                value={time}
                onChange={(e) => ChangeTime(e.target.value.toString())}
              />
            </div>

            {isPageFlg !== 2 && (
              <>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>金額</span>
                  <input
                    type="text"
                    value={dispAmount}
                    onChange={(e) => NumberCheck1(e.target.value)}
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
                    type="text"
                    value={dispAmount}
                    onChange={(e) => NumberCheck1(e.target.value)}
                    onBlur={FrontZeroDel}
                    className='TransactionValue'
                  />
                </div>
                {beforePageFlg !== 2 && (
                  <div className='TransactionGroup'>
                    <span className='TransactionLabel'>手数料</span>
                    <input
                      type="text"
                      value={dispAmount2}
                      onChange={(e) => NumberCheck2(e.target.value)}
                      onBlur={FrontZeroDel}
                      className='TransactionValue'
                    />
                  </div>
                )}
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>振替元</span>
                  <div className='TransactionValueSelect' onClick={() => handleOpenAssets(false)}>
                    <span className='TransactionSelectspan'>{disAssets}</span>
                  </div>
                </div>
                <div className='TransactionGroup'>
                  <span className='TransactionLabel'>振替先</span>
                  <div className='TransactionValueSelect' onClick={() => handleOpenAssets(true)}>
                    <span className='TransactionSelectspan'>{disAssets2}</span>
                  </div>
                </div>
              </>)}
          </div>
        </div>

        <div className='TransactionMemoLabel'>
          <textarea className='TransactionMemo' value={disMemo} onChange={(e) => setMemo(e.target.value)} />
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
              disNotAssets_p={disNotAssets_p}
              disNotAssets_n={disNotAssets_n}
              onSelect={(value) => handleAssetsValue(value)}
            />
          </>
        )}
        {isCategoryOpen && (
          <>
            <CategoryModal
              isLockPageFlg={isPageFlg}
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
        <button onClick={() => CopyTransactionData()} className='btn-style'>コピー</button>
        <button onClick={() => SaveTransactionData()} className='btn-style'>更新</button>
        <button onClick={() => DeleteTransactionData()} className='btn-style'>削除</button>
        <button onClick={() => onClose(false, 0, null)} className='btn-style'>閉じる</button>
      </div>
    </div>
  );
};

export default CreateTransaction;
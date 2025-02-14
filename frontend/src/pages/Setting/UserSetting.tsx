import React, { useEffect, useState } from 'react';
import '../../styles.css'; // CSSファイルのインポート
import AssetsModal from '../Modal/AssetsModal';
import CategoryModal from '../Modal/CategoryModal';

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
  UserNo: number;
  UserName: string;
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

const UserSetting: React.FC<OpenButtonProps> = ({ onClose }) => {
  const [errorMessages, setErrorMessages] = useState<string>('');

  const [ExcludeAfterDate, setExcludeAfterDate] = useState<boolean>(false); // 日付以降を計上しない設定
  const [DefaultTransactionType, setDefaultTransactionType] = useState<number>(0); // デフォルト取引タイプ (0: Expense, 1: Income)
  const [DefaultTransactionDisplay, setDefaultTransactionDisplay] = useState<number>(0); // デフォルト取引タイプ (0: Expense, 1: Income)
  const [MonthStartDate, setMonthStartDate] = useState<number>(1); // 月の開始日
  const [WeekStartDay, setWeekStartDay] = useState<number>(0); // 週の開始曜日 (0: Sunday ～ 6: Saturday)
  const [ShowZeroAmountItems, setShowZeroAmountItems] = useState<boolean>(false); // 0円項目の表示/非表示

  const [disCategory, setCategory] = useState<string>("未選択");
  const [disCategoryID, setCategoryID] = useState<number>(0);
  const [disAssets, setAssets] = useState<string>("未選択");
  const [disAssetsID, setAssetsID] = useState<number>(0);
  const [disSubcategory, setSubcategory] = useState<string>("未選択");
  const [disSubcategoryID, setSubcategoryID] = useState<number>(0);
  const [SubcategoryUpdateTime, setSubcategoryUpdateTime] = useState<Date>(new Date());
  const [CategoryUpdateTime, setCategoryUpdateTime] = useState<Date>(new Date());
  const [AssetsUpdateTime, setAssetsUpdateTime] = useState<Date>(new Date());

  const [discategory_p, setDisCategory_p] = useState<Category[]>([]);
  const [discategory_n, setDisCategory_n] = useState<Category[]>([]);
  const [disAssets_p, setDisAssets_p] = useState<Assets[][]>([]);
  const [disAssets_n, setDisAssets_n] = useState<Assets[][]>([]);
  const [disNotAssets_p, setDisNotAssets_p] = useState<Assets[][]>([]);
  const [disNotAssets_n, setDisNotAssets_n] = useState<Assets[][]>([]);
  const [disSubcategory_p, setDisSubcategory_p] = useState<Subcategory[][]>([]);
  const [disSubcategory_n, setDisSubcategory_n] = useState<Subcategory[][]>([]);

  const [isCategoryOpen, setisCategoryOpen] = useState<boolean>(false);
  const [isCategoryID, setisCategoryID] = useState<number>(0);
  const [isSubcategoryID, setisSubcategoryID] = useState<number>(0);
  const [isAssetsOpen, setisAssetsOpen] = useState<boolean>(false);
  const [isAssets, setisAssets] = useState<boolean>(false);
  const [isAssetsID, setisAssetsID] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getusersetting', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('帳簿情報の取得時にエラーが発生しました。');
        }

        const data = await response.json();
        const usersetting = data.usersetting;
        const assetses = data.assets;
        const categoryies = data.category;

        SetAssetsData(assetses);
        SetCategoryData(categoryies);

        setExcludeAfterDate(Boolean(usersetting.ExcludeAfterDate));
        setDefaultTransactionType(Number(usersetting.DefaultTransactionType));
        setDefaultTransactionDisplay(Number(usersetting.DefaultTransactionDisplay));
        setMonthStartDate(Number(usersetting.MonthStartDate));
        setWeekStartDay(Number(usersetting.WeekStartDay));
        setShowZeroAmountItems(Boolean(usersetting.ShowZeroAmountItems));

        SearchAssets(Number(usersetting.AutoFeeAllocationAssetsID), assetses)
        SearchCategory(Number(usersetting.AutoFeeAllocationCategoryID), Number(usersetting.AutoFeeAllocationSubcategoryID), categoryies)

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
      const response = await fetch('/api/getusersetting', {
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
    let usernames: string[] = [];

    let index = -1;
    let assetsnames_p: Assets[][] = [];
    let assetsnames_n: Assets[][] = [];
    let not_assetsnames_p: Assets[][] = [];
    let not_assetsnames_n: Assets[][] = [];

    // ユーザ情報ごとにデータを分ける
    assets.forEach((asset: any) => {
      if (hozUserNo !== asset.UserNo) {
        hozUserNo = asset.UserNo;
        usernames.push(asset.UserName);
        if(!Boolean(asset.Excluded)){
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
        if(!Boolean(asset.Excluded)){
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
  }

  const SetCategoryData = (category: any) => {
    let CategoryID = -1;
    let pindex = -1;
    let nindex = -1;
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

  const SearchAssets = (assetID:number, assets:any[]) =>{
    assets.forEach((asset: any) => {
      if(assetID === Number(asset.AssetsID)){
        setAssets(asset.AssetsName || "");
        setAssetsID(asset.AssetsID || 0);
        setAssetsUpdateTime(asset.UpdateTime || new Date());
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

  const SaveUserSetting = async () => {
    try {
      const response = await fetch('/api/changeusersetting', {
        method: 'POST',
        body: JSON.stringify({ 
          ExcludeAfterDate: ExcludeAfterDate, // 変数名そのままで
          AutoFeeAllocationCategoryID: disCategoryID,
          AutoFeeAllocationSubcategoryID: disSubcategoryID,
          AutoFeeAllocationAssetsID: disAssetsID,
          DefaultTransactionDisplay: DefaultTransactionDisplay,
          DefaultTransactionType: DefaultTransactionType,
          MonthStartDate: MonthStartDate,
          WeekStartDay: WeekStartDay,
          ShowZeroAmountItems: ShowZeroAmountItems,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      localStorage.setItem('ExcludeAfterDate', String(ExcludeAfterDate));
      localStorage.setItem('AutoFeeAllocationCategoryID', String(disCategoryID));
      localStorage.setItem('AutoFeeAllocationSubcategoryID', String(disSubcategoryID));
      localStorage.setItem('AutoFeeAllocationAssetsID', String(disAssetsID));
      localStorage.setItem('DefaultTransactionDisplay', String(DefaultTransactionDisplay));
      localStorage.setItem('DefaultTransactionType', String(DefaultTransactionType));
      localStorage.setItem('MonthStartDate', String(MonthStartDate));
      localStorage.setItem('WeekStartDay', String(WeekStartDay));
      localStorage.setItem('ShowZeroAmountItems', String(ShowZeroAmountItems));

      if (!response) {
        setErrorMessages('エラーが');
      } else if (!response.ok) {
        console.log(response);
        setErrorMessages('予期しないエラーが発生しました。');
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        setErrorMessages(error.message);
      } else {
        setErrorMessages('予期しないエラーが発生しました。');
      }
      return
    }
    
    onClose(false, 0)
  }

  // モーダルを閉じる処理と、選択された値の保持
  const handleCategoryValue = (category: any, subcategory: any) => {
    if (category === null && subcategory === null) {
      setCategoryID(0)
      setCategory("未選択")

      setSubcategoryID(0)
      setSubcategory("未選択");

      fetchData()
  } else if (!(category === undefined && subcategory === undefined)) {

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
  }else {
    if (value.Flg == 0) {
    setAssetsID(value?.AssetsID);
    setAssets(value?.AssetsName);
    setAssetsUpdateTime(value?.UpdateTime);
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
    setisAssetsID(disAssetsID);
    setisAssetsOpen(true);
  };

  return (
    <div className='TransactionPopUp'>
      <h1>ユーザ設定</h1>

      <div className='Category'>
        <div className='TransactionGroup'>
          <span className='UserSettingLabel'>日付以降を計上する</span>
          <input
            className='TransactionValue'
            type="checkbox"
            checked={ExcludeAfterDate}
            onChange={(e) => setExcludeAfterDate(e.target.checked)}
          />
        </div>
        
        <div className='TransactionGroup'>
          <span className='UserSettingLabel'>デフォルトの入出金表示</span>
          <select
            className='TransactionValue'
            value={DefaultTransactionDisplay}
            onChange={(e) => setDefaultTransactionDisplay(Number(e.target.value))}
          >
          <option value={3}>日別</option>
          <option value={2}>カレンダー</option>
          <option value={1}>概要</option>
          </select>
        </div>
        
        <div className='TransactionGroup'>
          <span className='UserSettingLabel'>デフォルトの入出金設定</span>
          <select
            className='TransactionValue'
            value={DefaultTransactionType}
            onChange={(e) => setDefaultTransactionType(Number(e.target.value))}
          >
          <option value={0}>収入</option>
          <option value={1}>支出</option>
          <option value={2}>振替</option>
          </select>
        </div>

        <div className='TransactionGroup'>
          <span className='UserSettingLabel'>手数料の資産やカテゴリ設定</span>
          <div className='TransactionValueSelect' onClick={() => handleOpenCategory()} >
            <span className='TransactionSelectspan'>{disCategory}</span>
            <span className='TransactionSelectspan'>{disSubcategory}</span>
          </div>
          <div className='TransactionValueSelect' onClick={() => handleOpenAssets(false)}>
            <span className='TransactionSelectspan'>{disAssets}</span>
          </div>
        </div>

        <div className='TransactionGroup'>
          <span className='UserSettingLabel'>月の開始日</span>
          <select
            className='TransactionValue'
            value={MonthStartDate}
            onChange={(e) => setMonthStartDate(Number(e.target.value))}
          >
            {Array.from({ length: 31 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </div>

        <div className='TransactionGroup'>
          <span className='UserSettingLabel'>週の開始曜日</span>
          <select
            className='TransactionValue'
            value={WeekStartDay}
            onChange={(e) => setWeekStartDay(Number(e.target.value))}
          >
          <option value={0}>日曜日</option>
          <option value={1}>月曜日</option>
          <option value={2}>火曜日</option>
          <option value={3}>水曜日</option>
          <option value={4}>木曜日</option>
          <option value={5}>金曜日</option>
          <option value={6}>土曜日</option>
          </select>
        </div>

        <div className='TransactionGroup'>
          <span className='UserSettingLabel'>0円の項目を資産一覧表示しない</span>
          <input
            className='TransactionValue'
            type="checkbox"
            checked={ShowZeroAmountItems}
            onChange={(e) => setShowZeroAmountItems(Boolean(e.target.checked))}
          />
        </div>
      </div>

      <div style={{ color: "red" }}>
        {errorMessages}
      </div>

      <div className='PopUpButtonGroup'>
        <button onClick={() => SaveUserSetting()} className='btn-style'>登録</button>
        <button onClick={() => onClose(false, 0)} className='btn-style'>閉じる</button>
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
              isLockPageFlg={1}
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

    </div>
  );
};

export default UserSetting;
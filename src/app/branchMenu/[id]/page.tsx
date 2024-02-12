'use client'
import { storeList } from "@/External/lists";
import { fireStoreDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoFastFoodOutline } from "react-icons/io5";
import { MdAdd, MdEdit, MdSearch } from "react-icons/md";
import styles from './branchMenu.module.css';
import Screen from "@/components/Screen/Screen";

interface Branch extends Record<string, any> { };

const BranchMenu = () => {
  const { id } = useParams();
  const bid = decodeURIComponent(id.toString());
  const [branch, setBranch] = useState<Branch>({});
  const [fullFoodsList, setFullFoodsList] = useState<Branch[]>([]);
  const [foods, setFoods] = useState<Branch[]>([]);
  const store = storeList.find((store) => store.name == bid.split(',')[0]);

  const [fullCategoryList, setFullCategoryList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    const getBranch = async () => {
      const branchTemp = await getDoc(doc(fireStoreDB, 'Branches/' + bid));
      const updatedBranchTemp: Branch = { id: branchTemp.id, ...branchTemp.data() }
      console.log(updatedBranchTemp.storeId)
      const store = (await getDoc(doc(fireStoreDB, 'Stores/' + updatedBranchTemp.storeId))).data();
      setBranch(updatedBranchTemp);
      setFullCategoryList(store!.categoryList);
      setCategoryList(store!.categoryList);
    }
    getBranch();

    const getFoods = async () => {
      const foodQuery = query(collection(fireStoreDB, 'Foods/'), where('branch', '==', bid));
      const foodsTemp = await getDocs(foodQuery);
      setFullFoodsList(foodsTemp.docs.map((food) => ({ id: food.id, ...food.data() })));
      setFoods(foodsTemp.docs.map((food) => ({ id: food.id, ...food.data() })));
    }
    getFoods();
  }, [])

  const selectFilter = (val: string) => {
    if (val === 'all') {
      setCategoryList(fullCategoryList);
    } else {
      const categoryListTemp = fullCategoryList.filter((category) => category.toLowerCase() === val.toLowerCase());
      setCategoryList(categoryListTemp);
    }
  }

  const keyWordFilter = (val: string) => {
    const foodsTemp = fullFoodsList.filter((food) => food.name.toLowerCase().includes(val.toLowerCase()));
    setFoods(foodsTemp);
  }

  return (
    <main>
      <Sidebar />

      <Screen>
        <header className={'screenHeader'}>
          <select value={''} onChange={(e) => { selectFilter(e.target.value) }}>
            <option hidden>Select Category</option>
            <option value={'all'}>All</option>
            {Object.keys(branch).length > 0 &&
              fullCategoryList.map((category: string, i: number) => (
                <option value={category} key={i}>{category}</option>
              ))
            }
          </select>
          <strong>{bid} Menu</strong>

          <div className={'searchBox'}>
            <input type="text" onChange={(e) => { keyWordFilter(e.target.value) }} />
            <MdSearch />
          </div>
        </header>

        <Link href={{ pathname: '/addFood', query: { bid: bid } }} className="addBox">
          <MdAdd />
          <IoFastFoodOutline />
        </Link>

        {Object.keys(branch).length > 0 ?
          <section className='segmentBox'>
            {categoryList.map((category: string, i: number) => (
              foods.filter((food) => food.category.toLowerCase() === category.toLowerCase()).length > 0 &&
              <section key={i} className={'segment'}>
                <h5>{category} <sub></sub></h5>
                <section className={'items'}>
                  {foods.length > 0 &&
                    foods.filter((food) => food.category.toLowerCase() === category.toLowerCase()).map((food, fi) => (
                      <div key={fi} className={styles.singleBox} style={{ background: store?.theme, color: store?.secondary }}>
                        <div className={styles.imgBox}>
                          <Image alt="" fill sizes="1" src={food.img} />
                        </div>
                        <p>
                          <strong>{food.name}</strong>
                          {food.type === 'single' ?
                            <span>GHS {food.price}</span>
                            : <span>GHS {food.sizes[0].price} - {food.sizes[food.sizes.length - 1].price} </span>
                          }
                        </p>
                        <nav>
                          <Link href={{ pathname: '/editFood', query: { fid: food.id } }}>
                            <MdEdit />
                          </Link>
                        </nav>
                      </div>
                    ))
                  }
                </section>
              </section>
            ))}
          </section>
          : <Loader />
        }
      </Screen>
    </main>
  );
}

export default BranchMenu;
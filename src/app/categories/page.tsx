'use client'
import { fireStoreDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiDish } from "react-icons/bi";
import { MdAdd, MdEdit, MdSearch } from "react-icons/md";

interface CategoryType extends Record<string, any> { };

const Categories = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(fireStoreDB, 'Categories/'))
      .then((res) => {
        const categoriesTemp: CategoryType[] = res.docs.map((cat) => ({ id: cat.id, ...cat.data() }));
        setCategories(categoriesTemp);
        setIsLoading(false);
      })

  }, [])

  return (
    <main>
      <Sidebar />

      <Screen>
        <header className={'screenHeader'}>
          <select>
            <option hidden>Select Category</option>
          </select>
          <strong>All Categories</strong>

          <div className={'searchBox'}>
            <input type="text" />
            <MdSearch />
          </div>
        </header>


        {!isLoading ?
          <section className="segmentBox">
            <Link href={'/addCategory'} className="addBox">
              <MdAdd />
              <BiDish />
            </Link>
            <section className="segment">
              <section className="items">
                {categories.map((category, i) => (
                  <div className="category" key={i}>
                    <article>
                      <div className="imgBoxBig">
                        <Image alt="" fill sizes="1" src={category.bigImg} />
                      </div>
                      <div className="imgBox">
                        <Image alt="" fill sizes="1" src={category.img} />
                      </div>
                    </article>
                    <strong>{category.name}</strong>
                    <Link href={{ pathname: '/editCategory', query: { cid: category.id } }}>
                      <MdEdit />
                    </Link>
                  </div>
                ))}
              </section>
            </section>
          </section>
          :
          <Loader />
        }
      </Screen>
    </main>
  );
}

export default Categories;
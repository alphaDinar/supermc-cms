'use client'
import { fireStoreDB, storageDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";

interface defType extends Record<string, any> { };
const EditStore = ({ searchParams }: { searchParams: { sid: string } }) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [counter, setCounter] = useState('');
  const [logo, setLogo] = useState<Blob>(new Blob);
  const [logoInfo, setLogoInfo] = useState<defType>({});
  const [logoPreview, setLogoPreview] = useState('');

  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [categories, setCategories] = useState<defType[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(searchParams.sid)
    getDoc(doc(fireStoreDB, 'Stores/' + searchParams.sid))
      .then((storeObj) => {
        if (storeObj.exists()) {
          const store = storeObj.data();
          setName(store.name);
          setCounter(store.counter);
          setCategoryList(store.categoryList);
          setLogoPreview(store.logo);
          setIsLoading(false);
        }
      });

    getDocs(collection(fireStoreDB, 'Categories/'))
      .then((res) => {
        const categoryListTemp = res.docs.map((store) => ({ id: store.id, ...store.data() }));
        setCategories(categoryListTemp);
      })
  }, [searchParams.sid])

  const toggleCat = (id: string) => {
    if (categoryList.includes(id)) {
      const catTemp = categoryList.filter((cat) => cat != id);
      setCategoryList(catTemp);
    } else {
      const catTemp = [...categoryList, id];
      setCategoryList(catTemp);
    }
  }

  const editStore = () => {
    const edit = (url: string) => {
      updateDoc(doc(fireStoreDB, 'Stores/' + searchParams.sid), {
        name: name,
        logo: url,
        categoryList: categoryList,
        counter: counter,
      })
        .then(() => {
          alert('completed');
          setIsLoading(false);
        })
    }

    if (!logoInfo.size) {
      setIsLoading(true);
      edit(logoPreview);
    } else {
      if (logoInfo.size > 150000) {
        alert(`logo size is ${logoInfo.size / 1000}kb, reduce to max of 150kb`);
      } else {
        const stamp = new Date().getTime();
        setIsLoading(true);
        uploadBytes(storageRef(storageDB, 'Stores/' + `${logoInfo.name}${stamp}`), logo)
          .then((res) => {
            getDownloadURL(res.ref)
              .then((url) => {
                edit(url);
              }
              )
          })
      }
    }
  }

  const deleteStore = () => {
    const ask = confirm(`Are you sure you want to delete ${searchParams.sid}`);
    if (ask) {
      setIsLoading(true);
      deleteDoc(doc(fireStoreDB, 'Stores/' + searchParams.sid))
        .then(() => {
          router.back();
        })
    }
  }

  return (
    <main>
      <Sidebar />

      <Screen>
        <section className={'formHeader'}>
          <p>
            <MdArrowBack onClick={() => router.back()} />
            <strong>Edit Store</strong>
          </p>
          <button type='button' onClick={deleteStore}>Delete</button>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), editStore() }}>
            <div>
              <span>Name *</span>
              <input readOnly type="text" value={name} onChange={(e) => { setName(e.target.value) }} required />
            </div>
            <div>
              <span>Counter *</span>
              <input type="number" value={counter} onChange={(e) => { setCounter(e.target.value) }} required />
            </div>
            <div className="categorySelectBox">
              {categories.map((cat, i) => (
                <legend onClick={() => toggleCat(cat.id.toString())} className={categoryList.includes(cat.id) ? "categoryStore" : 'categoryStore inactive'} key={i}>{cat.name}</legend>
              ))}
            </div>
            <div>
              <span>Logo *</span>
              <label htmlFor="addImage">
                Add Logo
                <input id="addImage" type="file" onChange={(e) => { setLogo(e.target.files![0]), setLogoInfo(e.target.files![0]), setLogoPreview(URL.createObjectURL(e.target.files![0])) }} />
              </label>
            </div>
            <div className="storePreviewBox" style={{ backgroundImage: `url(${logoPreview})` }}></div>
            <button type="submit">Save Changes</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default EditStore;
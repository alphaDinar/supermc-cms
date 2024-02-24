'use client'
import { fireStoreDB, storageDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";


interface defType extends Record<string, any> { };
const AddCategory = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [counter, setCounter] = useState(1);
  const [store, setStore] = useState('');
  const [stores, setStores] = useState<defType[]>([]);
  const [storeList, setStoreList] = useState<string[]>([]);

  const [image, setImage] = useState<Blob>(new Blob);
  const [imageInfo, setImageInfo] = useState<defType>({});
  const [imagePreview, setImagePreview] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStores = async () => {
      const storesTemp = await getDocs(collection(fireStoreDB, 'Stores/'));
      const stores: defType[] = storesTemp.docs.map((store) => ({ id: store.id, ...store.data() }));
      setStores(stores);
      setIsLoading(false);
    }

    getStores();
  }, [])

  const clearForm = () => {
    setName('');
    setCounter(1);
    setStore('');
    setStoreList([]);
    setImagePreview('');
  }

  const toggleCat = (id: string) => {
    if (storeList.includes(id)) {
      const storeTemp = storeList.filter((el) => el != id);
      setStoreList(storeTemp);
    } else {
      const storeTemp = [...storeList, id];
      setStoreList(storeTemp);
    }
  }

  const createCategory = () => {
    if (storeList.length > 0) {
      const add = (url: string, stamp: number) => {
        setDoc(doc(fireStoreDB, 'Categories/' + name), {
          name: name,
          counter: counter,
          img: url,
          storeList: storeList,
          store: store,
          timestamp: stamp
        })
          .then(() => {
            clearForm();
            alert('completed');
            setIsLoading(false);
          })
      }

      if (imageInfo.size > 200000) {
        alert(`image size is ${imageInfo.size / 1000}kb, reduce to max of 200kb`);
      } else {
        const stamp = new Date().getTime();
        setIsLoading(true);
        uploadBytes(storageRef(storageDB, 'Stores/' + `${imageInfo.name}${stamp}`), image)
          .then((res) => {
            getDownloadURL(res.ref)
              .then((url) => add(url, stamp)
              )
          })
      }
    } else {
      alert(`select a store`);
    }
  }

  return (
    <main>
      <Sidebar />
      <Screen>
        <section className={'formHeader'}>
          <p>
            <MdArrowBack onClick={() => router.back()} />
            <strong>Add Category</strong>
          </p>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), createCategory() }}>
            <div>
              <span>Name *</span>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} required />
            </div>

            <div>
              <span>Counter *</span>
              <input type="number" min={1} value={counter} onChange={(e) => { setCounter(parseInt(e.target.value)) }} required />
            </div>

            <div className="categorySelectBox">
              {stores.map((store, i) => (
                <legend onClick={() => toggleCat(store.id)} className={storeList.includes(store.id) ? "categoryStore" : 'categoryStore inactive'} key={i}>{store.name}</legend>
              ))}
            </div>

            <div>
              <span>Main Store *</span>
              <select value={store} onChange={(e) => { setStore(e.target.value) }} required>
                <option hidden>Choose Store</option>
                {stores.map((store, i) => (
                  <option value={store.id} key={i}>{store.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span>Thumbnail *</span>
              <label htmlFor="addImage">
                Add Thumbnail
                <input id="addImage" type="file" onChange={(e) => { setImage(e.target.files![0]), setImageInfo(e.target.files![0]), setImagePreview(URL.createObjectURL(e.target.files![0])) }} required />
              </label>
            </div>
            <div className="storePreviewBox">
              <Image alt='' fill sizes="auto" src={imagePreview} />
            </div>
            <button type="submit">Create Category</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default AddCategory;
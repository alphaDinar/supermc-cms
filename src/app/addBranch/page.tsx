'use client'
import { fireStoreDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";

interface defType extends Record<string, any> { };
const AddBranch = () => {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');

  const [store, setStore] = useState('');
  const [storeList, setStoreList] = useState<defType[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(fireStoreDB, 'Stores/'))
      .then((res) => {
        const storeListTemp = res.docs.map((store) => ({ id: store.id, ...store.data() }));
        setStoreList(storeListTemp);
        setIsLoading(false);
      })
  }, [])

  const clearForm = () => {
    setLocation('');
    setAddress('');
  }

  const createBranch = () => {
    const selectedStore = storeList.find((el) => el.id === store);
    if (selectedStore) {
      setIsLoading(true);
      const stamp = new Date().getTime();
      const bid = `bid${stamp}`;
      const key = `${store}, ${location}`;
      setDoc(doc(fireStoreDB, 'Branches/' + bid), {
        key : key,
        storeId: store,
        address: address,
        location: location,
        timestamp: stamp
      })
        .then(() => {
          clearForm();
          alert('completed');
          setIsLoading(false);
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
            <strong>Add Branch</strong>
          </p>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), createBranch() }}>
            <select onChange={(e) => { setStore(e.target.value) }} required>
              <option hidden>Choose Store</option>
              {storeList.map((el, i) => (
                <option value={el.id} key={i}>{el.name}</option>
              ))}
            </select>
            <div>
              <span>Location *</span>
              <input type="text" value={location} onChange={(e) => { setLocation(e.target.value) }} required />
            </div>
            <div>
              <span>Address *</span>
              <input type="text" value={address} onChange={(e) => { setAddress(e.target.value) }} required />
            </div>
            <button type="submit">Create Branch</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default AddBranch;
'use client'
import { fireStoreDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, doc, getDoc, getDocs, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";

interface defType extends Record<string, any> { };
const EditBranch = ({ searchParams }: { searchParams: { bid: string } }) => {
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
      })

    getDoc(doc(fireStoreDB, 'Branches/' + searchParams.bid))
      .then((branchObj) => {
        const branch = branchObj.data();
        if (branch) {
          setLocation(branch.location);
          setAddress(branch.address);
          setStore(branch.storeId)
          setIsLoading(false);
        }
      })
  }, [searchParams.bid])

  const clearForm = () => {
    setLocation('');
    setAddress('');
  }

  const createBranch = () => {
    const selectedStore = storeList.find((el) => el.id === store);
    if (selectedStore) {
      setIsLoading(true);
      const stamp = new Date().getTime();
      deleteDoc(doc(fireStoreDB, 'Branches/' + searchParams.bid))
        .then(() => {
          setDoc(doc(fireStoreDB, 'Branches/' + `${store}, ${location}`), {
            store: selectedStore.name,
            storeId: store,
            counter: selectedStore.counter,
            logo: selectedStore.logo,
            address: address,
            location: location,
            timestamp: stamp
          })
            .then(() => {
              alert('completed');
              setIsLoading(false);
            })
        })
    }
  }

  const deleteBranch = () => {
    const ask = confirm(`Are you sure you want to delete ${searchParams.bid}`);
    if (ask) {
      setIsLoading(true);
      deleteDoc(doc(fireStoreDB, 'Branches/' + searchParams.bid))
        .then(() => {
          router.push(`/branches`);
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
            <strong>Edit {searchParams.bid}</strong>
          </p>
          <button type='button' onClick={deleteBranch}>Delete</button>
        </section>

        {isLoading ?
          <Loader />
          :
          <form onSubmit={(e) => { e.preventDefault(), createBranch() }}>
            <select value={store} onChange={(e) => { setStore(e.target.value) }} required>
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
            <button type="submit">Update Branch</button>
          </form>
        }
      </Screen>
    </main>
  );
}

export default EditBranch;
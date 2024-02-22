'use client'
import { fireStoreDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdAdd, MdEdit, MdStorefront } from "react-icons/md";

interface Store extends Record<string, any> { };

const Stores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStores = async () => {
      const storesTemp = await getDocs(collection(fireStoreDB, 'Stores/'));
      const stores: Store[] = storesTemp.docs.map((store) => ({ id: store.id, ...store.data() }));
      const counterList = storesTemp.docs.map((store) => store.data().counter);
      setStores(stores);
      setIsLoading(false);
    }

    getStores();
  }, [])

  return (
    <main>
      <Sidebar />

      <Screen>
        <header className={'screenHeader'}>
          <span></span>
          <strong>All Stores</strong>
          <span></span>
        </header>

        {!isLoading ?
          <section className='segmentBox'>
            <Link href={'/addStore'} className="addBox">
              <MdAdd />
              <MdStorefront/>
            </Link>
              <section className={'segment'}>
                <h5> <sub></sub></h5>
                <section className={'items'}>
                  {stores.map((store, i) => (
                    <div className={'branch'} key={i}>
                      <div className={'imgBox'}>
                        <Image alt='' fill sizes='1' src={store.logo} />
                      </div>
                      <strong>{store.name}</strong>
                      <nav style={{justifyContent : 'center'}}>
                        <Link href={{pathname : '/editStore', query : {sid : store.id}}}><MdEdit /></Link>
                      </nav>
                    </div>
                  ))
                  }
                </section>
              </section>
          </section>
          : <Loader />
        }
      </Screen>
    </main>
  );
}

export default Stores;
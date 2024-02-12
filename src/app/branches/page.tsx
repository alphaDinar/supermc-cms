'use client'
import { storeList } from "@/External/lists";
import { fireStoreDB } from '@/Firebase/Base';
import Loader from '@/components/Loader/Loader';
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdLocalDining, MdSearch } from "react-icons/md";
// import styles from './branches.module.css';
import Screen from "@/components/Screen/Screen";
import { TbGitBranch } from "react-icons/tb";

interface Branch extends Record<string, any> { };

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const getBranches = async () => {
      const branchesTemp = await getDocs(collection(fireStoreDB, 'Branches/'));
      const branches: Branch[] = branchesTemp.docs.map((branch) => ({ id: branch.id, ...branch.data() }));
      setBranches(branches);
    }

    getBranches();
  }, [])

  return (
    <main>
      <Sidebar />

      <Screen>
        <header className={'screenHeader'}>
          <select>
            <option hidden>Select store</option>
            {storeList.map((store, i) => (
              <option value="store" key={i}>{store.name}</option>
            ))}
          </select>
          <strong>All Branches</strong>

          <div className={'searchBox'}>
            <input type="text" />
            <MdSearch />
          </div>
        </header>

        {branches.length > 0 ?
          <section className='segmentBox'>
            <Link href={'/addBranch'} className="addBox">
              <MdAdd />
              <TbGitBranch />
            </Link>
            {storeList.map((store, i) => (
              <section key={i} className={'segment'}>
                <h5>{store.name} <sub></sub></h5>
                <section className={'items'}>
                  {branches.filter((branch) => branch.storeId === store.name).map((branch, i) => (
                    <div className={'branch'} key={i}>
                      <div className={'imgBox'}>
                        <Image alt='' fill sizes='1' src={store.logo} />
                      </div>
                      <strong>{branch.location}</strong>
                      <nav>
                        <Link href={`/branchMenu/${branch.id}`}><MdLocalDining style={{ background: store.theme }} /></Link>
                        <Link href={{pathname : '/editBranch', query : {bid : branch.id}}}><MdEdit /></Link>
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

export default Branches;
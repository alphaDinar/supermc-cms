'use client'
import { useEffect } from "react";
import { MdSearch } from "react-icons/md";

export const SearchBox = () => {
  useEffect(()=>{
    console.log('search')
  }, [])

  return (
    <div className={'searchBox'}>
      <input type="text" />
      <MdSearch />
    </div>
  );
}

export default SearchBox;
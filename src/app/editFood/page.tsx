'use client'
import { fireStoreDB, storageDB } from "@/Firebase/Base";
import Loader from "@/components/Loader/Loader";
import Screen from "@/components/Screen/Screen";
import Sidebar from "@/components/Sidebar/Sidebar";
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdAdd, MdArrowBack, MdDeleteOutline } from "react-icons/md";

interface Shot extends Record<string, any> { };
const EditFood = ({ searchParams }: { searchParams: { food: string } }) => {
  const router = useRouter();
  const food = JSON.parse(searchParams.food);

  const [name, setName] = useState(food.name);
  const [description, setDescription] = useState(food.description);
  const [branch, setBranch] = useState(food.branch);
  const [category, setCategory] = useState(food.category);
  const [duration, setDuration] = useState(food.duration);

  const [image, setImage] = useState<Blob>(new Blob);
  const [imageInfo, setImageInfo] = useState<Shot>({});
  const [oldImagePreview, setOldImagePreview] = useState(food.img);
  const [imagePreview, setImagePreview] = useState(food.img);

  const [branches, setBranches] = useState<Shot[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [type, setType] = useState(food.type);
  const [activateGroupType, setActivateGroupType] = useState<boolean>(food.type === 'grouped' ? true : false);
  const [groupType, setGroupType] = useState(food.groupType);

  const [price, setPrice] = useState(food.price);

  const sizeList = ['Small', 'Medium', 'Large', 'XLarge', 'XXLarge', 'Huge', 'XHuge'];
  const pieceList = ['2pcs', '3pcs', '6pcs', '9pcs', '10pcs', '12pcs', '20pcs'];
  const [priceList, setPriceList] = useState<string[]>(food.sizes.map((el: Shot) => el.price));

  const [ingredient, setIngredient] = useState('');

  const [ingredientList, setIngredientList] = useState<string[]>(food.ingredientList.map((el: Shot) => el.name));
  const [ingredientOptionList, setIngredientOptionList] = useState<string[]>(food.ingredientList.map((el: Shot) => el.optional));

  const [extra, setExtra] = useState('');
  const [extraPrice, setExtraPrice] = useState('0');

  const [extraList, setExtraList] = useState<string[]>(food.extraList.map((el: Shot) => el.name));
  const [extraPriceList, setExtraPriceList] = useState<string[]>(food.extraList.map((el: Shot) => el.price));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(fireStoreDB, 'Branches/'))
      .then((res) => {
        setBranches(res.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      })
    getDocs(collection(fireStoreDB, 'Categories/'))
      .then((res) => {
        setCategories(res.docs.map((doc) => doc.id));
        setCategory(food.category);
        setIsLoading(false);
      })
  }, [food.category])

  const handleGroupType = (val: string) => {
    if (val === 'grouped') {
      setActivateGroupType(true);
    } else {
      setActivateGroupType(false);
    }
  }

  const handlePriceList = (val: string, i: number) => {
    const updatedPriceList = [...priceList];
    updatedPriceList[i] = val;
    setPriceList(updatedPriceList);
  }

  const fixSizeList = () => {
    const finalIngredientList: Shot[] = [];
    const finalExtraList: Shot[] = [];

    ingredientList.map((el, i) => {
      finalIngredientList.push({ name: el, optional: ingredientOptionList[i] || 'no' })
    })
    extraList.map((el, i) => {
      finalExtraList.push({ name: el, price: extraPriceList[i] })
    })

    if (activateGroupType) {
      const finalSizeList: Shot[] = [];
      if (groupType === 'sizes') {
        sizeList.map((size, i) => {
          if (priceList[i]) {
            finalSizeList.push({ tag: size, price: priceList[i] });
          }
        })
      } else {
        pieceList.map((piece, i) => {
          if (priceList[i]) {
            finalSizeList.push({ tag: piece, price: priceList[i] });
          }
        })
      }

      updateFood(finalSizeList, finalIngredientList, finalExtraList);
    } else {
      updateFood([], finalIngredientList, finalExtraList);
    }
  }

  const addIngredient = () => {
    if (ingredient) {
      setIngredientList([...ingredientList, ingredient]);
      setIngredientOptionList([...ingredientOptionList, 'no']);
      setIngredient('');
    }
  }

  const removeIngredient = (val: string) => {
    setIngredientList(ingredientList.filter((el) => el !== val));
  }

  const addExtra = () => {
    if (extra) {
      setExtraList([...extraList, extra]);
      setExtraPriceList([...extraPriceList, '0']);
      setExtra('');
    }
  }

  const removeExtra = (val: string) => {
    const targetIndex = extraList.indexOf(val);
    setExtraList(extraList.filter((el, i) => i !== targetIndex));
    setExtraPriceList(extraPriceList.filter((el, i) => i !== targetIndex));
  }


  const updateFood = (finalSizeList: Shot[], finalIngredientList: Shot[], finalExtraList: Shot[]) => {
    const edit = (url: string) => {
      updateDoc(doc(fireStoreDB, 'Foods/' + food.id), {
        name: name,
        price: price,
        type: type,
        groupType: groupType,
        description: description,
        branch: branch,
        category: category,
        duration: duration,
        sizes: finalSizeList,
        ingredientList: finalIngredientList,
        extraList: finalExtraList,
        img: url,
      }).then(() => {
        router.back();
        setIsLoading(false);
      })
    }

    const timestamp = new Date().getTime();
    if (oldImagePreview === imagePreview) {
      setIsLoading(true);
      console.log('same old');
      edit(imagePreview);
    } else {
      if (imageInfo.size > 150000) {
        alert(`image size is ${imageInfo.size / 1000}kb, reduce to max of 150kb`);
      } else {
        setIsLoading(true);
        uploadBytes(storageRef(storageDB, 'Stores/' + `${imageInfo.name}${timestamp}`), image)
          .then((res) => {
            getDownloadURL(res.ref)
              .then((url) => {
                edit(url);
              })
          }).catch((error) => console.log(error));
      }
    }
  }

  const deleteFood = () => {
    const ask = confirm(`Are you sure you want to delete ${name}`);
    if (ask) {
      setIsLoading(true);
      deleteDoc(doc(fireStoreDB, 'Foods/' + food.id))
        .then(() => {
          router.push(`/branchMenu/${branch}`);
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
            <strong>Edit {name}</strong>
          </p>
          <button type='button' onClick={deleteFood}>Delete</button>
        </section>

        {
          isLoading ?
            <Loader />
            :
            <form onSubmit={(e) => { e.preventDefault(), fixSizeList() }}>
              <div>
                <span>Name *</span>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} required />
              </div>

              <div>
                <span>Description</span>
                <textarea value={description} onChange={(e) => { setDescription(e.target.value) }}></textarea>
              </div>

              <div>
                <span>Branch *</span>
                <select value={branch} onChange={(e) => { setBranch(e.target.value) }}>
                  <option hidden>Choose Branch</option>
                  {branches.map((el, i) => (
                    <option value={el.id} key={i}>{el.key}</option>
                  ))}
                </select>
              </div>

              <div>
                <span>Category *</span>
                <select value={category} onChange={(e) => { setCategory(e.target.value) }}>
                  <option hidden>Choose Category</option>
                  {categories.map((el, i) => (
                    <option value={el} key={i}>{el}</option>
                  ))}
                </select>
              </div>
              <div>
                <span>Time to cook *</span>
                <input type="number" value={duration} onChange={(e) => { setDuration(e.target.value) }} placeholder="minutes" />
              </div>

              <div>
                <span>Add ingredients (optional to customer or not)</span>
                <p>
                  <input type="text" value={ingredient} onChange={(e) => { setIngredient(e.target.value) }} />
                  <legend onClick={addIngredient}><MdAdd /></legend>
                </p>

                <ul>
                  {ingredientList.map((el, i) => (
                    <li key={i}>
                      <sub>#{i + 1}</sub>
                      <span>{el}</span>
                      <select onChange={(e) => { ingredientOptionList[i] = e.target.value }}>
                        <option value="no">no</option>
                        <option value="yes">yes</option>
                      </select>
                      <sup onClick={() => { removeIngredient(el) }}><MdDeleteOutline /></sup>
                    </li>
                  ))}
                </ul>
              </div>


              <div>
                <span>Add Extras (with 0 or extra charges)</span>
                <p>
                  <input type="text" value={extra} onChange={(e) => { setExtra(e.target.value) }} />
                  <legend onClick={addExtra}><MdAdd /></legend>
                </p>

                <ul>
                  {extraList.map((el, i) => (
                    <li key={i}>
                      <sub>#{i + 1}</sub>
                      <span>{el}</span>
                      <input type="number" style={{ maxWidth: '80px' }} value={extraPriceList[i]} onChange={(e) => {
                        const extraPriceListTemp = [...extraPriceList];
                        extraPriceListTemp[i] = e.target.value;
                        setExtraPriceList(extraPriceListTemp);
                      }} />
                      <sup onClick={() => { removeExtra(el) }}><MdDeleteOutline /></sup>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span>Type *</span>
                <select value={type} onChange={(e) => { setType(e.target.value); handleGroupType(e.target.value) }}>
                  <option hidden>Select Type</option>
                  <option value="single">Single</option>
                  <option value="grouped">Grouped</option>
                  <option value="special">Special</option>
                </select>
              </div>

              {activateGroupType &&
                <div>
                  <span>Group type *</span>
                  <select value={groupType} onChange={(e) => { setGroupType(e.target.value) }}>
                    <option value="sizes">Sizes</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              }

              {activateGroupType ?
                groupType !== 'pieces' ?
                  <div className="sizeBox">
                    <span>Size and Price</span>
                    <article>
                      {sizeList.map((el, i) => (
                        <h4 key={i}>
                          <span style={{ background: 'salmon', color: 'white' }}>{el}</span>
                          <input type="number" name="" value={priceList[i]} onChange={(e) => { handlePriceList(e.target.value, i) }} />
                          {/* <small onClick={() => { removeSize(el.tag) }}>
              </small> */}
                        </h4>
                      ))}
                    </article>
                  </div> :
                  <div className="sizeBox">
                    <span>No. of Pieces and Price</span>
                    <article>
                      {pieceList.map((el, i) => (
                        <h4 key={i}>
                          <span style={{ background: 'salmon', color: 'white' }}>{el}</span>
                          <input type="number" name="" value={priceList[i]} onChange={(e) => { handlePriceList(e.target.value, i) }} />
                          {/* <small onClick={() => { removeSize(el.tag) }}>
              </small> */}
                        </h4>
                      ))}
                    </article>
                  </div>
                :
                <div>
                  <span>Price</span>
                  <input type="number" value={price} onChange={(e) => { setPrice(e.target.value) }} />
                </div>
              }
              <div>
                <span>Image *</span>
                <label htmlFor="addImage">
                  Add Image
                  <input id="addImage" type="file" onChange={(e) => { setImage(e.target.files![0]), setImageInfo(e.target.files![0]), setImagePreview(URL.createObjectURL(e.target.files![0])) }} />
                </label>
              </div>

              <div className="storePreviewBox" style={{ backgroundImage: `url(${imagePreview})` }}></div>

              <button type="submit">Update Food</button>
            </form>
        }
      </Screen>
    </main>
  );
}

export default EditFood;
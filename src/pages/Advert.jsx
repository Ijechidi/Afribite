import { useContext, useEffect, useState } from "react";
import Banner from "../components/Banner"
import { FiImage } from "react-icons/fi";
import { LuPoundSterling } from "react-icons/lu";
import { ChoiceDate } from "../components/ui/DatePicker";
import { Link} from "react-router-dom";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthenticationContext";
import { profileContext } from "../context/ProfileContext";
import LoadingButton from "../components/LoadingButton";



const Advert = () => {
  const{
    adForm, 
    setAdForm, 
    adStartDate, 
    adEndDate, 
    setAdStartDate, 
    setAdEndDate, 
    adImagePreview, 
    setAdImagePreview,
  } = useContext(profileContext)
  const {user} = useAuth()
  const [userAdData, setUserAdData] = useState([]);  // State to store user data
  const [loading, setLoading] = useState(false); 
  const [showAds, setShowAds] = useState(false);

  

  const handleChange = (e) => {
    const {name, value} = e.target
    setAdForm((prev)=>(
      {...prev,
        [name]: value
      }
    ))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdForm((prev)=>(
        {...prev,
          image: file
        }
      ))
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const db = getFirestore();
      const storage = getStorage();

      let imageUrl = null;
      if (adForm.image) {
        const storageRef = ref(storage, `adverts/${adForm.image.name}`);
        await uploadBytes(storageRef, adForm.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const userSubcollectionRef = collection(db, "adverts", user.uid, "advertData");

       await addDoc(userSubcollectionRef,{
        title : adForm.Title,
        description : adForm.Description,
        image : imageUrl,
        audience : adForm.audience,
        budget: adForm.budget,
        startDate: adStartDate.toISOString(),
        endDate: adEndDate.toISOString(),
      } )

      setLoading(false)
      
      const notify =()=> {
        toast.success("Ad posted successfully!", {
          position: "top-right",
        })
      }
  
      notify()
    
    } catch (error) {
      setLoading(false)
      console.error("Error adding document: ", error);
      const errorNotify =()=> {
        toast.error("Error Creating ad!, try again later", {
          position: "top-right",
        })
      } 
      errorNotify() 
    }
  
    setAdForm(()=>(
      {
        Title: '',
        Description: '', 
        image:'', 
        budget:'', 
        audience:'' }
    )
    )
    setAdImagePreview(null)
    setAdStartDate(new Date())
    setAdEndDate(new Date())
  };


  const fetchUserData = async () => {
    try {
      if (user) {
        const db = getFirestore();
        // Reference the "advertData" subcollection under the user's document
        const userSubcollectionRef = collection(db, 'adverts', user.uid, 'advertData');
        
        // Fetch all documents from the subcollection
        const querySnapshot = await getDocs(userSubcollectionRef);
        
        // Extract data from each document
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update state with the fetched data
        setUserAdData(data);
        ;
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
  };

  const clearForm = () =>{

    setAdForm(()=>(
      {
        Title: '',
        Description: '', 
        image:'', 
        budget:'', 
        audience:'' }
    )
    )
    setAdImagePreview(null)
    setAdStartDate(new Date())
    setAdEndDate(new Date())

  }

  useEffect(()=>{
    fetchUserData();
    setAdEndDate(
      adStartDate
    )
  },[adStartDate])


  return (
    <div className="w-[90%] m-auto p-6 lg:px-32 lg:py-16 bg-n-n6 rounded-lg shadow-md overflow-hidden">
      {/* banner section */}
      <Banner
        text={"Boost Your Brand Visibility and Drive Sales with Advertisements"}
      />

      <ToastContainer />

      {/* Ad form */}
      <form action="" className="mt-6 sm:mt-8 w-full text-n-n3" onSubmit={handleSubmit} >
        <h1 className="font-semibold sm:text-2xl text-[#E2725B] text-start">
          Create Ad
        </h1>

            <p className="mt-4 font-semibold text-[#E2725B]">Ad title</p>
            <input
            required
            name="Title"
            value={adForm.Title}
            onChange={handleChange}
            type="text" 
            className="border-2 bg-inherit border-[#E2725B]/20 w-full p-2 rounded-lg focus:outline-none focus:border-[#E2725B] "/>

            <p className="mt-4 font-semibold text-[#E2725B] ">Description</p>
            <textarea
            required
            placeholder="Write a detailed description about your Ad" 
            name="Description"
            value={adForm.Description}
            onChange={handleChange}
            id="" 
            rows={5} 
            className="border-2 bg-inherit border-[#E2725B]/20 w-full p-2 rounded-lg focus:outline-none focus:border-[#E2725B] placeholder:text-[#E2725B]/40 placeholder:p-1"></textarea>

        <p className="mt-4 font-semibold text-[#E2725B] ">Upload image</p>
        <div className="flex gap-4 items-center p-4 bg-white justify-center border-2 border-dashed">
        {adImagePreview ? (
              <img src={adImagePreview} alt="Preview" className="w-32 h-32 object-cover" />
            ) : (
              <FiImage className="text-5xl text-n-n3" />
            )}
          <p className="">
            Upload an image for your restaurant banner (GIF,JPG or PNG){" "}
          </p>
          <input
            required
            id="file"
            type="file"
            accept="image/png, image/gif, image/jpeg"
            className=" min-w-0 max-w-32 text-white file:hidden text-xs lg:text-sm border-2 bg-p-button p-3 rounded-md font-pop hover:border-p-button hover:text-p-button hover:bg-n-n7"
            onChange={handleImageChange}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between text-sm md:text-base md:mt-4 md:px-3 ">
          <div>
          <p className="mt-4 font-semibold text-[#E2725B]">Audience</p>

          <div className="mt-2">
          <div className="flex gap-2 ">
          <input required name="audience" type="radio" value='everybody' checked={adForm.audience === 'everybody'} onChange={handleChange} /> <p className="text-[#E2725B]">Everyone</p>
          </div>
          
          <div className="flex gap-2">
          <input required  name="audience" type="radio" value='newcomers' checked={adForm.audience === 'newcomers'} onChange={handleChange} /> <p className="text-[#E2725B]">Newcomers</p>
          </div>
          </div>
            
          </div>

          <div>
            <p className="mt-4 font-semibold text-[#E2725B]">Budget</p>
            <div className='relative flex '>
              <LuPoundSterling className="absolute left-2 top-3.5 text-n-n3" />
              <input
              required
              name="budget"
              value={adForm.budget}
              onChange={handleChange}
              type="number" 
              className="border-2 bg-inherit border-[#E2725B]/20 w-full pl-6 p-2 rounded-lg focus:outline-none focus:border-[#E2725B] "/>     
            </div>
          </div>
        </div>


        <div className="flex flex-col md:flex-row gap-5 md:gap-0 justify-between text-sm md:text-base mt-4  ">
              <span>
                 <h3 className="text-[#E2725B] font-semibold">Start date</h3>
                 <ChoiceDate value={adStartDate} onChange={setAdStartDate} />
              </span>

              <span >
                   <h3 className="text-[#E2725B] font-semibold ">End date</h3>
                   <ChoiceDate value={adEndDate} onChange={setAdEndDate} minDate={adStartDate}/>
              </span>
        </div>        
        <div className="flex justify-end items-center mt-4 gap-5">
      {loading ? (<LoadingButton/>): (<button type="submit" className="p-3 border-2 text-xs lg:text-sm text-white bg-p-button3 rounded-md transition-colors hover:border-p-button3 hover:text-p-button3 hover:bg-white ">
            Post Ad
          </button>)}
          <button onClick={clearForm} type="button" className="p-3 border-2 text-xs lg:text-sm text-white bg-[#E2725B] rounded-md transition-colors hover:border-[#E2725B] hover:text-[#E2725B] hover:bg-white ">
            Clear form
          </button>
        <Link to='/Adminhome/Dashboard'><p  className="text-[#E2725B] font-semibold">Cancel</p></Link>
        </div>
      </form>

      <div className="mt-8">
        <button
          onClick={() => setShowAds(!showAds)}
          className="text-xs lg:text-sm p-3 bg-[#E2725B] text-white rounded-md hover:bg-[#D1614A] transition-colors"
        >
          {showAds ? "Hide Created Ads" : "Show Created Ads"}
        </button>

        {showAds && (
          <div className="mt-4 p-4 border-2 border-[#E2725B] rounded-lg">
            <h3 className="text-xl font-semibold text-[#E2725B] mb-4">Ads created</h3> 
            {userAdData.length === 0 ? (
            <p>No data available</p>
          ) : (
            userAdData.map((ad) => (
              <div key={ad.id} className="mb-4 p-2 bg-white/10 rounded flex">
                <div className="w-1/4 mr-4">
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto object-cover rounded" />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded">
                      <FiImage className="text-gray-400 text-4xl" />
                    </div>
                  )}
                </div>
                <div className="w-3/4">
                <h4 className="font-semibold"> <span className="text-[#E2725B] "> TITLE: </span>  {ad.title}</h4>
                  <p> <span className="text-[#E2725B]"> Description: </span>  {ad.description}</p>
                  <p> <span className="text-[#E2725B]"> Audience:  </span> {ad.audience}</p>
                  <p> <span className="text-[#E2725B]"> Budget:  </span> {ad.budget}</p>
                  <p> <span className="text-[#E2725B]"> Start Date:  </span> {formatDate(ad.startDate)}</p>
                  <p> <span className="text-[#E2725B]"> End Date:  </span> {formatDate(ad.endDate)}</p>
                  {/* <p className="text-sm  text-gray-500"> <span className=" text-[#E2725B] ">Created:</span> {userAdData.createdAt.toLocaleString()}</p> */}
                </div>
              </div>
            )))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Advert;

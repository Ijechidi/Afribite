import { createContext, useState, useEffect } from "react";
import { useAuth } from '../context/AuthenticationContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';



export const profileContext = createContext()

const ProfileContextProvider = (props) => {
    const [myProfile, setMyProfile] = useState({})
    const [loading, setLoading] = useState(true);
    const [adForm, setAdForm] = useState({Title: '', Description: '', image:'', budget:'', audience:'' })
    const [adStartDate, setAdStartDate] = useState(new Date());
    const [adEndDate, setAdEndDate] = useState(adStartDate);
    const [adImagePreview, setAdImagePreview] = useState(null);
    const { user } = useAuth();


    const fetchUserProfile = async () => {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            setMyProfile(prevProfile => ({
              ...prevProfile,
                ...userDoc.data(),
                email: user.email || prevProfile.email,
                profileImage: user.photoURL || prevProfile.profileImage
            }));
        } else {
  
            setMyProfile(prevProfile => ({
                ...prevProfile,
                email: user.email || '',
                profileImage: user.photoURL || null
            }));
        }
        setLoading(false);
        
    };

  useEffect(() => {

    if (user) {
        fetchUserProfile();
    }
}, [user]);

    const value = {
     myProfile,loading, 
     fetchUserProfile, 
     adForm, 
     setAdForm, 
     adEndDate, 
     setAdEndDate, 
     adStartDate, 
     setAdStartDate,
     adImagePreview, 
     setAdImagePreview
    }
    return(
        <profileContext.Provider value={value}>
            {props.children}
        </profileContext.Provider>
    )
}

export default ProfileContextProvider
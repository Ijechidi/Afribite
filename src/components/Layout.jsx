import { useLocation } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"
import { useContext } from "react"
import { NavContext } from "../context/navbar"

const Layout = ({children}) => {
  const{visible} = useContext(NavContext)
  const location = useLocation()

  return (
    <div className={`${location.pathname === '/Adminhome/Dashboard' ? "bg-[#D9D9D9]" :'bg-backgroud'} bg-cover`}>
      <div className={`h-lvh flex flex-row ${location.pathname === '/Adminhome/Dashboard'? "":'backdrop-blur-sm bg-black/65'} overflow-hidden`}>
        <AdminSidebar className=''/>
        <main className={`${location.pathname !== '/Adminhome/Dashboard' ? 'sm:p-16' : 'p-4 lg:px-16'} ${visible ? 'hidden': ''} mx-auto my-4 sm:my-0 w-full overflow-scroll`}>
            {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
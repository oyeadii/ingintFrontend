import React from "react"
import Icon from "@/components/ui/Icon"
import SwitchDark from "./Tools/SwitchDark"
import useWidth from "@/hooks/useWidth"
import useSidebar from "@/hooks/useSidebar"
import useNavbarType from "@/hooks/useNavbarType"
import useMenulayout from "@/hooks/useMenulayout"
import useSkin from "@/hooks/useSkin"
import Logo from "./Tools/Logo"
import Profile from "./Tools/Profile"
import Notification from "./Tools/Notification"
import Message from "./Tools/Message"
import useRtl from "@/hooks/useRtl"
import useMobileMenu from "@/hooks/useMobileMenu"
import { useDispatch } from "react-redux"
import { handleLogout } from "@/components/partials/auth/store"
import HorizentalMenu from "./Tools/HorizentalMenu"
import ProjectSwitch from "./Tools/ProjectSwitch"

const Header = ({ className = "custom-class" }) => {
  const dispatch = useDispatch()

  const [collapsed, setMenuCollapsed] = useSidebar()
  const { width, breakpoints } = useWidth()
  const [navbarType] = useNavbarType()
  const navbarTypeClass = () => {
    switch (navbarType) {
      case "floating":
        return "floating  has-sticky-header"
      case "sticky":
        return "sticky top-0 z-[999]"
      case "static":
        return "static"
      case "hidden":
        return "hidden"
      default:
        return "sticky top-0"
    }
  }
  const [menuType] = useMenulayout()
  const [skin] = useSkin()
  const [isRtl] = useRtl()

  const [mobileMenu, setMobileMenu] = useMobileMenu()

  const handleOpenMobileMenu = () => {
    setMobileMenu(!mobileMenu)
  }

  const borderSwicthClass = () => {
    if (skin === "bordered" && navbarType !== "floating") {
      return "border-b border-slate-200 dark:border-slate-700"
    } else if (skin === "bordered" && navbarType === "floating") {
      return "border border-slate-200 dark:border-slate-700"
    } else {
      return "dark:border-b dark:border-slate-700 dark:border-opacity-60"
    }
  }
  return (
    <header className={className + " " + navbarTypeClass()}>
      <div
        className={` app-header md:px-6 px-[15px]  dark:bg-slate-800 shadow-base dark:shadow-base3 bg-background text-white
        ${borderSwicthClass()}
             ${
               menuType === "horizontal" && width > breakpoints.xl
                 ? "py-1"
                 : " py-3"
             }
        `}
      >
        <div className="flex justify-between items-center h-full">
          {/* For Vertical  */}
          <Logo />

          {/* For Horizontal  */}

          {/*  Horizontal  Main Menu */}
          <HorizentalMenu />
          {/* Nav Tools  */}
          {/* <ProjectSwitch /> */}

          <div className="nav-tools flex items-center  rtl:space-x-reverse">
            {/* <SwitchDark /> */}

            {width >= breakpoints.md && <Profile />}
            {width <= breakpoints.md && (
              <div
                className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                onClick={handleOpenMobileMenu}
              >
                <Icon icon="heroicons-outline:menu-alt-3" />
              </div>
            )}

            <p
              className="capitalize flex  cursor-pointer"
              onClick={() => dispatch(handleLogout(false))}
            >
              <Icon icon="material-symbols:logout" />
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

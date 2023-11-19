"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ToastContainer } from "react-toastify"
import useWidth from "@/hooks/useWidth"
import useContentWidth from "@/hooks/useContentWidth"
import useMobileMenu from "@/hooks/useMobileMenu"
import { useSelector } from "react-redux"
import useRtl from "@/hooks/useRtl"
import useDarkMode from "@/hooks/useDarkMode"
import useSkin from "@/hooks/useSkin"
import Loading from "@/components/Loading"
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import useNavbarType from "@/hooks/useNavbarType"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/partials/adminHeader"
export default function RootLayout({ children }) {
  const { width, breakpoints } = useWidth()
  const [isRtl] = useRtl()
  const [isDark] = useDarkMode()
  const [skin] = useSkin()
  const [navbarType] = useNavbarType()

  const router = useRouter()
  const { isAdmin } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/adminLogin")
    }
  }, [isAdmin])
  const location = usePathname()
  // header switch class
  const switchHeaderClass = () => {
    return ""
  }

  // content width
  const [contentWidth] = useContentWidth()
  // mobile menu
  const [mobileMenu, setMobileMenu] = useMobileMenu()

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`app-warp ${isDark ? "dark" : "light"} ${
        skin === "bordered" ? "skin--bordered" : "skin--default"
      }
      ${navbarType === "floating" ? "has-floating" : ""}
      `}
    >
      <ToastContainer />
      <Header className={"tr:ml-[198px] rtl:mr-[198px]"} />

      {/* <Header className={width > breakpoints.xl ? switchHeaderClass() : ""} /> */}
      {/* mobile menu overlay*/}
      {width < breakpoints.xl && mobileMenu && (
        <div
          className="overlay bg-slate-900/50 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}
      {/* <Settings /> */}
      <div
        className={`content-wrapper transition-all duration-150 ${
          width > 1280 ? switchHeaderClass() : ""
        }`}
      >
        {/* md:min-h-screen will h-full*/}
        <div className="page-content   page-min-height  ">
          <div
            className={
              contentWidth === "boxed" ? "container mx-auto" : "container-fluid"
            }
          >
            <motion.div
              key={location}
              initial="pageInitial"
              animate="pageAnimate"
              exit="pageExit"
              variants={{
                pageInitial: {
                  opacity: 0,
                  y: 50,
                },
                pageAnimate: {
                  opacity: 1,
                  y: 0,
                },
                pageExit: {
                  opacity: 0,
                  y: -50,
                },
              }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.5,
              }}
            >
              <Suspense fallback={<Loading />}>
                <Breadcrumbs />
                {children}
              </Suspense>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

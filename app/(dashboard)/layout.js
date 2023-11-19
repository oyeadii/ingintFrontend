"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ToastContainer } from "react-toastify"
import Header from "@/components/partials/header"
import useContentWidth from "@/hooks/useContentWidth"

import { useSelector } from "react-redux"
import useRtl from "@/hooks/useRtl"
import useDarkMode from "@/hooks/useDarkMode"
import useSkin from "@/hooks/useSkin"
import Loading from "@/components/Loading"
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import useNavbarType from "@/hooks/useNavbarType"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import Chat from "@/components/chat/Chat"
const Joyride = dynamic(() => import("react-joyride"), { ssr: false })

export default function RootLayout({ children }) {
  const [isRtl] = useRtl()
  const [isDark] = useDarkMode()
  const [skin] = useSkin()
  const [navbarType] = useNavbarType()
  const router = useRouter()
  const { isAuth } = useSelector((state) => state.auth)
  const isOpen = useSelector((state) => state.layout.customizer)
  const [run, setRun] = useState(false)

  const steps = [
    {
      target: "#chat",
      spotlightClicks: true,
      styles: {
        options: {
          zIndex: 10000,
        },
      },

      content: "Data Explorer ! You Can Ask Questions on Your data!",
      placement: "right",
    },
    {
      target: "#overview",
      content: "Overview of Your Data",
    },
  ]
  useEffect(() => {
    if (!isAuth) {
      router.push("/")
    }
    //darkMode;
  }, [isAuth])
  useEffect(() => {
    setRun(true)
  }, [])
  const [menuData, setMenuData] = useState([])

  const location = usePathname()
  const getDashboardData = () => {}
  // header switch class

  // content width
  const [contentWidth] = useContentWidth()

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`app-warp    ${isDark ? "dark" : "light"} ${
        skin === "bordered" ? "skin--bordered" : "skin--default"
      }
      ${navbarType === "floating" ? "has-floating" : ""}
      `}
    >
      <ToastContainer />
      <Header className={"tr:ml-[198px] rtl:mr-[198px]"} />

      <Joyride
        styles={{
          options: {
            zIndex: 10000, // or any high value to bring it to front
          },
        }}
        steps={steps}
        run={run}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
      />
      {/* <Header className="mr-[400px] ml-[220px]" /> */}

      {/* <Chat /> */}
      <div
        className={`content-wrapper transition-all duration-150  ml-0 
         ${false ? "mr-[400px] ml-[220px]" : " "}
        `}
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

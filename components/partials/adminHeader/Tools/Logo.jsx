"use client"

import React, { Fragment } from "react"
import useDarkMode from "@/hooks/useDarkMode"
import Link from "next/link"
import useWidth from "@/hooks/useWidth"

const Logo = () => {
  const [isDark] = useDarkMode()
  const { width, breakpoints } = useWidth()

  return (
    <div className="flex">
      <Link href="/admin/manage-users">
        <React.Fragment>
          {width >= breakpoints.xl ? (
            <div>
              <img
                src={
                  isDark
                    ? "/assets/images/logo/logo.png"
                    : "/assets/images/logo/logo.png"
                }
                alt=""
                className="h-8 w-8"
              />
            </div>
          ) : (
            <img
              src={
                isDark
                  ? "/assets/images/logo/logo.png"
                  : "/assets/images/logo/logo.png"
              }
              alt=""
              className="h-8 w-8"
            />
          )}
        </React.Fragment>
      </Link>
      <span className="flex items-center font-semibold text-xl">Ingint</span>
    </div>
  )
}

export default Logo

"use client"
import Link from "next/link"
import useDarkMode from "@/hooks/useDarkMode"
import AdminLoginForm from "@/components/partials/auth/admin-login"

// image import

const Login = () => {
  const [isDark] = useDarkMode()
  return (
    <>
      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="flex-1 bg-background relative z-[1]">
            <div className="max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20 text-white">
              <Link href="/">
                <img
                  src={
                    isDark
                      ? "/assets/images/logo/logo.png"
                      : "/assets/images/logo/logo.png"
                  }
                  alt=""
                  className="mb-10 h-8"
                />
              </Link>
              <h4 className="text-white">
                Unlock your Project{" "}
                <span className="text-white dark:text-slate-400 font-bold">
                  performance
                </span>
              </h4>
            </div>
            {/* <div className="absolute left-0 2xl:bottom-[-160px] bottom-[-130px] h-full w-full z-[-1]">
              <img
                src="/assets/images/auth/ils1.svg"
                alt=""
                className="h-full w-full object-contain"
              />
            </div> */}
          </div>
          <div className="right-column relative">
            <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
              <div className="auth-box h-full flex flex-col justify-center">
                <div className="mobile-logo text-center mb-6 lg:hidden block">
                  <Link href="/">
                    <img
                      src={
                        isDark
                          ? "/assets/images/logo/logo-white.svg"
                          : "/assets/images/logo/logo.svg"
                      }
                      alt=""
                      className="mx-auto"
                    />
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-4">
                  <h4 className="font-medium">Sign in</h4>
                  <div className="text-slate-500 text-base">
                    Sign in to your account to start using Ingint
                  </div>
                </div>
                <AdminLoginForm />
              </div>
              <div className="auth-footer text-center">
                Copyright 2021, Ingint All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login

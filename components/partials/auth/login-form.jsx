import React, { useState } from "react"
import Textinput from "@/components/ui/Textinput"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/navigation"
import Checkbox from "@/components/ui/Checkbox"
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import { handleLogin } from "./store"
import { ToastContainer, toast } from "react-toastify"
import { apiCall } from "@/helper/api_call"
import Button from "@/components/ui/Button"
const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
    password: yup.string(),
    newPassword: yup
      .string()
      .min(6, "Password must be at least 8 characters")
      .max(20, "Password shouldn't be more than 20 characters"),
    // confirm password
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
  })
  .required()
const LoginForm = () => {
  const dispatch = useDispatch()
  const [password, setPassword] = useState("")
  const [changePassword, setChangePassword] = useState(false)
  const [newData, setNewData] = useState()
  const [loading, setLoading] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    //
    mode: "all",
  })
  const router = useRouter()
  const onSubmit = async (userData) => {
    setLoading(true)
    var myHeaders = {
      email: userData?.email,
      password: password,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/user_login`,
      {},
      myHeaders,
      "POST"
    )
    setLoading(false)

    if (isSuccess) {
      if (data?.auth) {
        dispatch(handleLogin(data))
        setTimeout(() => {
          router.push("/searchGPT")
        }, 1500)
        toast.success("User logged in successfully", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
      } else if (data?.newToken) {
        setNewData(data)
        setChangePassword(true)
      }
    }
  }
  const changePasswordSubmit = async (userData) => {
    let body = {
      old_password: userData.currentPassword,
      new_password: userData.newPassword,
    }
    let headers = {
      newToken: newData?.newToken,
      userId: newData?.userId,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/new_pass`,
      headers,
      body,
      "POST"
    )
    if (isSuccess) {
      setChangePassword(false)
    }
  }

  const [checked, setChecked] = useState(false)

  return (
    <>
      <ToastContainer />

      {!changePassword && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
          <Textinput
            name="email"
            label="email"
            type="email"
            placeholder="Enter Email"
            register={register}
            error={errors?.email}
          />
          <Textinput
            name="password"
            label="password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            register={register}
            error={errors?.password}
          />
          <div className="flex justify-end">
            <Link
              href="/adminLogin"
              className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
            >
              Admin Login?{" "}
            </Link>
          </div>

          <Button
            text="Sign in"
            className="btn-main btn text-white block w-full text-center py-[10px] leading-6 text-sm px-4"
            isLoading={loading}
            type="submit"
            iconClass="text-[20px] mr-2"
            icon="solar:login-2-outline"
          />
        </form>
      )}
      {changePassword && (
        <form
          onSubmit={handleSubmit(changePasswordSubmit)}
          className="space-y-4"
        >
          <Textinput
            name="currentPassword"
            label="Current Password"
            type="password"
            register={register}
            autoComplete="off"
            placeholder="Enter Current Password"
            error={errors.currentPassword}
          />

          <Textinput
            name="newPassword"
            label="New Password"
            type="password"
            register={register}
            autoComplete="off"
            placeholder="Enter New Password"
            error={errors.newPassword}
          />

          <Textinput
            name="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            register={register}
            autoComplete="off"
            placeholder="Confirm New Password"
            error={errors.confirmNewPassword}
          />

          <button
            className="btn btn-main block w-full text-center"
            type="submit"
          >
            Change Password
          </button>
        </form>
      )}
    </>
  )
}

export default LoginForm

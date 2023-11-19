import React, { useState } from "react"
import Textinput from "@/components/ui/Textinput"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/navigation"
import Checkbox from "@/components/ui/Checkbox"
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import { handleAdminLogin } from "./store"
import { ToastContainer, toast } from "react-toastify"
import { apiCall } from "@/helper/api_call"
import Button from "@/components/ui/Button"
const schema = yup
  .object({
    email: yup.string().required("Email is Required"),
    password: yup.string().required("Password is Required"),
  })
  .required()
const AdminLoginForm = () => {
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword)
  }
  const dispatch = useDispatch()
  const { users } = useSelector((state) => state.auth)
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
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    var myHeaders = {
      email: userName,
      password: password,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/admin_login`,
      {},
      myHeaders,
      "POST"
    )

    if (isSuccess) {
      setLoading(false)
      dispatch(handleAdminLogin(data))
      setTimeout(() => {
        router.push("/admin/manage-users")
      }, 1500)
    } else {
      setLoading(false)
    }
  }

  const [checked, setChecked] = useState(false)

  return (
    <form onSubmit={onSubmit} className="space-y-4 ">
      <ToastContainer />

      <Textinput
        placeholder="Enter Email"
        label="Email"
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <div className="fromGroup">
        <label className="black capitalize form-label">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="form-control py-2"
          />
          <Button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 py-[10px] leading-6 text-sm px-4"
            onClick={togglePasswordVisibility}
            icon={
              showPassword ? "carbon:view-off-filled" : "carbon:view-filled"
            }
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Link
          href="/"
          className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
        >
          User? Click Here to Login{" "}
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
  )
}

export default AdminLoginForm

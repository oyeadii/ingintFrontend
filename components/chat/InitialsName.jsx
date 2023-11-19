import React from "react"
import { useSelector } from "react-redux"

const InitialsName = () => {
  const { isAuth } = useSelector((state) => state.auth)

  const initials = isAuth
    ? isAuth?.userName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : ""
  return (
    <div className=" mr-2 w-8 h-8  rounded-full bg-blue-500 text-white flex items-center justify-center text-base">
      {initials}
    </div>
  )
}

export default InitialsName

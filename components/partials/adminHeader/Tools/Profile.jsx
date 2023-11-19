import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import ProjectSwitch from "./ProjectSwitch"
const InitialsProfilePicture = ({ name }) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  return (
    <div className="  w-6 h-6 mr-1  rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
      {initials}
    </div>
  )
}
const ProfileLabel = ({ name }) => {
  return (
    <div className="flex items-center">
      <div className="flex-none text-white dark:text-white text-sm font-semibold items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap">
        <span className=" capitalize overflow-hidden  whitespace-nowrap w-[85px] block">
          {name}
        </span>
      </div>
    </div>
  )
}

const Profile = () => {
  const [profileName, setProfileName] = useState("")
  const { isAuth } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuth) {
      setProfileName(isAuth?.userName)
    }
  }, [])
  return (
    <div className="flex justify-between">
      <InitialsProfilePicture name={"admin"} />
      <ProfileLabel name={"admin"} />
    </div>
  )
}

export default Profile

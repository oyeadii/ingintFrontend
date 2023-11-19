import React, { useEffect, useState } from "react"
import Dropdown from "@/components/ui/Dropdown"
import { useSelector } from "react-redux"
import useToken from "@/hooks/useToken"
import { useDispatch } from "react-redux"
import { apiCall } from "@/helper/api_call"
import { toast } from "react-toastify"
import Icon from "@/components/ui/Icon"
import { Menu, Transition } from "@headlessui/react"
import { handleLogin, handleLogout } from "@/components/partials/auth/store"

function truncateText(text, maxLength) {
  if (text?.length <= maxLength) {
    return text
  }
  return text?.substring(0, maxLength) + "..."
}
const ProfileLabel = ({ currentProject, getUsers }) => {
  const truncatedProject = truncateText(currentProject, 14)

  return (
    <div
      onClick={() => getUsers()}
      className="flex  text-[0.875rem] font-semibold text-slate-100 "
    >
      <div className="">
        <span className="truncate">{truncatedProject} </span>
        <span className=" inline-block mt-1  rtl:mr-[10px]">
          <Icon icon="heroicons-outline:chevron-down"></Icon>
        </span>
      </div>
    </div>
  )
}
const ProjectSwitch = () => {
  const { isAuth } = useSelector((state) => state.auth)
  const [token, setToken] = useToken()

  const [data, setData] = useState("")
  const dispatch = useDispatch()

  const getUsers = async (e) => {
    // e.preventDefault()?
    // setIsLoaded(true)
    // setEditingIndex(-1)

    // setUpdatedValues({})
    let myHeaders = {
      authorization: `Bearer ${isAuth.auth}`,
    }

    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/project_switch`,
      myHeaders
    )

    if (isSuccess) {
      setData(data)
    }
  }
  const changeProject = async (id) => {
    // e.preventDefault()?
    // setIsLoaded(true)
    // setEditingIndex(-1)

    // setUpdatedValues({})
    let myHeaders = {
      authorization: `Bearer ${isAuth.auth}`,
    }

    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/project_switch`,
      myHeaders,
      {
        project_id: id,
      },
      "POST"
    )

    if (isSuccess) {
      setToken(data?.token)

      const updatedData = { ...isAuth }
      updatedData.is_play = data?.is_play
      dispatch(handleLogin(updatedData))
      toast.success("Project Switched", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })

      getUsers()
    }
  }
  useEffect(() => {
    if (isAuth) {
      getUsers()
    }
  }, [])
  return (
    <div className=" flex flex-col mr-3 ">
      <Dropdown
        label={
          <ProfileLabel
            currentProject={data?.current_project?.project_name}
            getUsers={getUsers}
          />
        }
        classMenuItems="w-[130px]  left-[0px]"
      >
        {data &&
          data?.project_list.map((item, index) => (
            <Menu.Item key={index}>
              {({ active }) => (
                <div
                  onClick={() => changeProject(item?.project_id)}
                  className={`${
                    active
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                      : "text-slate-600 dark:text-slate-300"
                  } block     ${
                    item.hasDivider
                      ? "border-t border-slate-100 dark:border-slate-700"
                      : ""
                  }`}
                >
                  <div className={`block cursor-pointer px-4 py-2`}>
                    <div className="flex ">
                      <span className="block text-sm">{item.project_name}</span>
                    </div>
                  </div>
                </div>
              )}
            </Menu.Item>
          ))}
      </Dropdown>
    </div>
  )
}

export default ProjectSwitch

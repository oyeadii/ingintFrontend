"use client"
import React, { useState, useEffect } from "react"
import { PickList } from "primereact/picklist"
import { Checkbox } from "primereact/checkbox"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useSelector } from "react-redux"
import { apiCall } from "@/helper/api_call"
import { ToastContainer, toast } from "react-toastify"
import Tooltip from "@/components/ui/Tooltip"
import Icon from "@/components/ui/Icon"

export default function CustomPickList({
  userId,
  num_assignments,
  getUsers,
  projectName,
}) {
  const { isAdmin } = useSelector((state) => state.auth)

  const [source, setSource] = useState([])
  const [target, setTarget] = useState([])
  const [checked, setChecked] = useState(false)
  const [initialAssignedUsers, setInitialAssignedUsers] = useState([])
  const [checkboxes, setCheckboxes] = useState([])
  const [openPicklist, setOpenPicklist] = useState(false)
  const transformData = () => {
    // // Create a set of IDs from the initial array for efficient lookup
    // const initialIds = new Set(initialAssignedUsers.map((item) => item.id))
    // const targetIds = new Set(target.map((item) => item.id))

    // // Filter out the IDs that are in the initial array but not in the updated array (removed)
    // const removedIds = initialAssignedUsers.filter(
    //   (item) => !targetIds.has(item.id)
    // )

    // // Filter out the IDs that are in the updated array but not in the initial array (added)
    // const addedIds = target.filter((item) => !initialIds.has(item.id))

    // // Create a mapping of IDs to is_admin values from checkboxes
    // const isAdminMap = Object.fromEntries(
    //   checkboxes
    //     .map((value, id) => [id, value])
    //     .filter((entry) => entry[1] !== null) // Filter out null values
    // )

    // // Transform the data for both added and removed IDs
    // const transformedData = [
    //   ...removedIds.map((item) => ({
    //     id: item.id,
    //     param: "users",
    //     is_admin: isAdminMap[item.id] || false,
    //     remove: true, // Indicates it's removed
    //   })),
    //   ...addedIds.map((item) => ({
    //     id: item.id,
    //     param: "users",
    //     is_admin: isAdminMap[item.id] || false,
    //     remove: false, // Indicates it's added
    //   })),
    // ]

    const transformArrData = []

    target.forEach((item) => {
      transformArrData.push({
        id: item.id,
        param: "users",
        is_admin: item.is_admin == 1 ? true : false,
        remove: false, // Indicates it's removed
      })
    })

    initialAssignedUsers.forEach((item) => {
      const foundObject = target.find((obj) => obj.id === item.id)
      if (!foundObject) {
        transformArrData.push({
          id: item.id,
          param: "users",
          is_admin: item.is_admin == 1 ? true : false,
          remove: true, // Indicates it's removed
        })
      }
    })

    console.log(transformArrData)

    return transformArrData
  }
  const getUserDetails = async () => {
    // e.preventDefault()?
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }

    let body = {
      page: "0",
      project_id: userId,
      type: "admin",
      details: "false",
    }

    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/details`,
      myHeaders,
      body
    )

    if (isSuccess) {
      setSource(data?.results?.user_list)
      setTarget(data?.results?.project_user)
      setInitialAssignedUsers(data?.results?.project_user)
    } else {
    }
  }

  const onChange = (event) => {
    setSource(event.source)
    setTarget(event.target)
  }
  const handleCheckboxChange = (item) => {
    // // Create a copy of the checkboxes array
    // const updatedCheckboxes = [...checkboxes]
    // // Toggle the checkbox state
    // updatedCheckboxes[index] = !updatedCheckboxes[index]
    // // Update the state with the new checkboxes array
    // setCheckboxes(updatedCheckboxes)

    const reqIndex = target.findIndex((obj) => obj.id === item?.id)

    if (target[reqIndex].is_admin == 1) {
      target[reqIndex].is_admin = 0
    } else {
      target[reqIndex].is_admin = 1
    }
  }
  const postProjectAssignment = async () => {
    // e.preventDefault()?
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }

    const details = transformData()
    let body = { details: transformData(), id: userId }
    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/user_project_assignment?q=projects`,
      myHeaders,
      body,
      "PUT"
    )

    if (isSuccess) {
      toast.success(data)
      setTarget([])
      getUsers()
    } else {
    }
  }
  const itemTemplate = (item, index) => {
    const targetId = target[0].id
    return (
      <div className="flex flex-wrap p-2 align-items-center gap-3 text-[#002b49]">
        <div className="flex-1 flex flex-column gap-2 ">
          <span className="font-bold">{item.email}</span>
        </div>
        <span className="font-bold text-900 ">
          {targetId === item.id ? (
            <span class="text-100 absolute top-0 right-5 text-xs">Admin</span>
          ) : null}
          <Checkbox
            onChange={() => handleCheckboxChange(item)}
            checked={item.is_admin == 1}
          ></Checkbox>
        </span>
      </div>
    )
  }
  const sourceTemplate = (item, index) => {
    return (
      <div className="flex flex-wrap p-2 align-items-center gap-3 text-[#002b49]">
        <div className="flex-1 flex flex-column gap-2 ">
          <span className="font-bold">{item.email}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <Modal
        className="!max-w-5xl"
        themeClass=" dark:bg-slate-800 dark:border-b dark:border-slate-700 "
        titleClass="text-[#002B49] font-bold"
        closeIconClass="text-[#002b49]"
        title={
          <div className="flex">
            <span className="ml-1">Project Assignments : {projectName}</span>
          </div>
        }
        activeModal={openPicklist}
        onClose={() => {
          setOpenPicklist(false)
        }}
        footerContent={
          <Button
            text="Save"
            className="btn-dark "
            onClick={() => {
              postProjectAssignment()
              setOpenPicklist(false)
            }}
          />
        }
      >
        {" "}
        <PickList
          source={source}
          filter
          filterBy="email"
          target={target}
          onChange={onChange}
          sourceItemTemplate={sourceTemplate}
          targetItemTemplate={itemTemplate}
          breakpoint="1400px"
          showSourceControls={false} // Hide the "Move All" button for the source list
          showTargetControls={false} // Hide the "Move All" button for the target list
          sourceHeader="Available"
          targetHeader="Assigned"
          sourceStyle={{ height: "24rem" }}
          targetStyle={{ height: "24rem" }}
          pt={{
            list: { style: { height: "342px" } },

            moveToSourceButton: {
              root: {
                className: "!bg-[#002b49] !text-white !dark:bg-blue-600",
              },
            },
            moveToTargetButton: {
              root: {
                className: "!bg-[#002b49] !text-white !dark:bg-blue-600",
              },
            },
            moveAllToTargetButton: {
              root: { className: "bg-teal-400 !border-teal-400 !hidden" },
            },
            moveAllToSourceButton: {
              root: { className: "bg-teal-400 !border-teal-400 !hidden" },
            },
            item: ({ context }) => ({
              className: context.selected ? "bg-blue-100" : undefined,
            }),
          }}
        />
      </Modal>
      <div className="flex gap-4">
        <Tooltip
          placement="top"
          arrow
          content="Assign or Remove Users from Project"
        >
          <button
            onClick={() => {
              setOpenPicklist(true)
              getUserDetails()
            }}
            className="bg-[#002b49] btn btn inline-flex justify-center text-white w-2"
          >
            <span className="text-[16px]">
              {" "}
              <Icon icon="tabler:plus-minus" />
            </span>
          </button>
        </Tooltip>
        <span className="flex items-center">{num_assignments}</span>
      </div>
    </div>
  )
}

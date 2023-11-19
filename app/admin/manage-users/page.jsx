"use client"
import Card from "@/components/ui/Card"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"

import "./ManageUsers.css"

import React, { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import Button from "@/components/ui/Button"
import { ToastContainer, toast } from "react-toastify"
import { apiCall } from "@/helper/api_call"
import { Icon } from "@iconify/react"
import Pagination from "@/components/ui/Pagination"
import Tooltip from "@/components/ui/Tooltip"
import UsersTable from "./DataTable"

const FormRepeater = ({ getUsers, setIsOpen }) => {
  const { isAdmin } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    engagement: "",
    project: "",
    existingProject: "No",
    isAdmin: "No",
    // Default value for the radio buttons
  })
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      user_data: [
        {
          email: formData.email,
          project_id:
            formData?.existingProject === "Yes" ? formData.project : null,
          first_name: formData?.first_name,
          last_name: formData?.last_name,
          admin: formData.isAdmin == "Yes" ? true : false,
        },
      ],
    }

    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/details`,
      myHeaders,
      body,
      "POST"
    )

    if (isSuccess) {
      toast.success("User Added successfully", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
      getUsers()
      setIsOpen(false)
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        engagement: "",
        project: "",
        existingProject: "No",
        isAdmin: "No",
      })
    } else {
    }
  }

  return (
    <div>
      <Card title="Add New User">
        <div>
          <div className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1 grid gap-5  last:mb-0">
            <div className={`fromGroup  `}>
              <label
                className={`block uppercase  text-slate-400 font-semibold text-[0.65rem]  lead`}
              >
                Email
              </label>
              <input
                type="text"
                className={`form-control py-2 `}
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className={`fromGroup  `}>
              <label
                className={`block uppercase  text-slate-400 font-semibold text-[0.65rem]  lead`}
              >
                First Name
              </label>
              <input
                type="text"
                className={`form-control py-2 `}
                placeholder="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className={`fromGroup  `}>
              <label
                className={`block uppercase  text-slate-400 font-semibold text-[0.65rem]  lead`}
              >
                Last Name
              </label>
              <input
                type="text"
                className={`form-control py-2 `}
                placeholder="First Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ltr:text-right rtl:text-left mt-2">
            <Button
              onClick={submitHandler}
              text="Submit"
              className=" text-white bg-[#6699cc]  h-min text-sm font-normal btn-sm "
            />
            <Button
              onClick={() => {
                setIsOpen(false)

                setFormData({
                  email: "",
                  first_name: "",
                  last_name: "",
                  engagement: "",
                  project: "",
                  existingProject: "No",
                  isAdmin: "No",
                  // Default value for the radio buttons
                })
              }}
              text="Cancel"
              className=" text-slate-900 border ml-2   h-min text-sm font-normal btn-sm "
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

const ProjectPostPage = () => {
  const [editingIndex, setEditingIndex] = useState(-1)
  const [adminData, setAdminData] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { isAdmin } = useSelector((state) => state.auth)
  const [data, setData] = useState([])
  const [sortOrder, setSortOrder] = useState("")
  const [currentOrderIcon, setCurrentOrderIcon] = useState("basil:sort-outline")
  const [updatedValues, setUpdatedValues] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterInput, setFilterInput] = useState("")
  const [filterSelect, setFilterSelect] = useState("")
  const [filterApplied, setFilterApplied] = useState(false)
  const [totalUsersCount, setTotalUsersCount] = useState("")
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleDelete = async (userId) => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      user_id: userId,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/details`,
      myHeaders,
      body,
      "DELETE"
    )
    if (isSuccess) {
      getUsers()
    }
  }

  const getUsers = async (filter = false) => {
    setIsLoaded(true)
    setEditingIndex(-1)

    setUpdatedValues({})
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }

    let body = {
      page: currentPage,
      type: "admin",
      engagement: filterSelect || "",
      user: filterInput || "",
      details: true,
    }
    if (filterApplied) {
      body["engagement"] = filterSelect
      body["user"] = filterInput
      setCurrentPage(1)
    }
    if (sortOrder) {
      ;(body["column"] = "email"), (body["order_by"] = sortOrder)
    }

    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/details`,
      myHeaders,
      body
    )

    if (isSuccess) {
      setIsLoaded(false)
      if (data?.count) {
        setTotalUsersCount(data?.count)

        setTotalPages(Math.ceil(data.count / 10))
        setData(data?.results.user_list)
      } else {
        setData(data?.user_list)
      }
    } else {
      setIsLoaded(false)
    }
  }
  useEffect(() => {
    getUsers()
    //DIL-662
  }, [currentPage, sortOrder, filterApplied, filterSelect])

  const handleUpdate = async (userId) => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      user_id: userId,
    }
    let updateData = updatedValues
    body["to_update"] = updateData
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/details`,
      myHeaders,
      body,
      "PUT"
    )
    if (isSuccess) {
      setEditingIndex(-1)

      getUsers()
    } else {
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <div>
      <ToastContainer />
      {isOpen && <FormRepeater getUsers={getUsers} setIsOpen={setIsOpen} />}

      <div className="">
        <Card className="mb-2 bg-white" noborder>
          <div className="flex justify-between  items-center">
            {!isOpen && (
              <div className="flex-none">
                <Tooltip placement="top" arrow content="Add New User">
                  <button
                    onClick={() => {
                      setIsOpen(true)
                    }}
                    className={`btn btn inline-flex justify-center  
          text-white bg-[#6699cc] h-min text-sm font-normal btn-sm`}
                  >
                    <span className="flex items-center">
                      <span className="ltr:mr-2 rtl:ml-2 text-[16px]">
                        <Icon icon={"heroicons-outline:plus-sm"} />
                      </span>

                      <span>Add User</span>
                    </span>
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </Card>{" "}
        {true ? (
          <Card
            title={`${totalUsersCount} Users`}
            noborder
            titleClass="font-semibold"
          >
            <div className="overflow-x-auto -mx-5">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden ">
                  <UsersTable
                    data={data}
                    updatedValues={updatedValues}
                    setUpdatedValues={setUpdatedValues}
                    handleUpdate={handleUpdate}
                    editingRowId={editingIndex}
                    setEditingRowId={setEditingIndex}
                    handleDelete={handleDelete}
                    getUsers={getUsers}
                    loading={isLoaded}
                    setSortOrder={setSortOrder}
                    sortOrder={sortOrder}
                    setCurrentOrderIcon={setCurrentOrderIcon}
                    currentOrderIcon={currentOrderIcon}
                  />
                </div>
              </div>
              <Pagination
                className="flex justify-center mt-3"
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
              />
            </div>
          </Card>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default ProjectPostPage

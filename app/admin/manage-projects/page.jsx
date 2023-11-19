"use client"
import Card from "@/components/ui/Card"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import "./ManageUsers.css"
import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import Button from "@/components/ui/Button"
import TableLoading from "@/components/skeleton/Table"
import { ToastContainer, toast } from "react-toastify"
import { apiCall } from "@/helper/api_call"
import { Icon } from "@iconify/react"
import { Dropdown } from "primereact/dropdown"
import Tooltip from "@/components/ui/Tooltip"
import UsersTable from "./DataTable"

const FormRepeater = ({ getProjectDetails, setIsOpen }) => {
  const { isAdmin } = useSelector((state) => state.auth)

  const [engagementData, setEngagementData] = useState()
  const [newUser, setNewUser] = useState({})
  const [value, setValue] = useState("Yes")
  const [selectedUsers, setSelectedUsers] = useState("")
  const [currentUsers, setCurrentUsers] = useState()
  const fetchEngagement = async () => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/engagements`,
      myHeaders
    )
    if (isSuccess) {
      setEngagementData(data)
    }
  }
  const fetchProjects = async () => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      page: "0",
      type: "admin",
      details: "false",
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/details`,
      myHeaders,
      body
    )
    if (isSuccess) {
      setSelectedUsers(data?.results?.user_list)
    }
  }
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
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
  const handleAddUser = (event, field) => {
    const { value } = event.target

    // Store the updated value in the state
    setNewUser((prevState) => ({
      ...prevState,
      [field]: value,
    }))
  }
  const transformData = () => {
    const details = currentUsers.map((item) => {
      const user_id = item
      const admin = true

      return {
        user_id,
        admin,
      }
    })

    return details
  }
  const submitHandler = async (e) => {
    e.preventDefault()
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      project: formData.project,
      user_data: [
        {
          user_id: currentUsers,
          admin: true,
        },
      ],
    }

    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/project_details`,
      myHeaders,
      body,
      "POST"
    )

    if (isSuccess) {
      toast.success("Project Created successfully", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
      getProjectDetails()
      setIsOpen(false)
      setFormData({
        email: "",
        fullName: "",
        project: "",
        existingProject: "No",
        isAdmin: "No",
        // Default value for the radio buttons
      })
    } else {
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div>
      <Card title="Add New Project">
        <div>
          <div className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1 grid gap-5  last:mb-0">
            <>
              <div className={`fromGroup  `}>
                <label
                  className={`block uppercase  text-slate-400 font-semibold text-[0.65rem]  lead`}
                >
                  Project Name
                </label>
                <input
                  type="text"
                  className={`form-control py-2 `}
                  placeholder="Project Name"
                  name="project"
                  value={formData?.project}
                  onChange={handleChange}
                />
              </div>
              <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                Project Owner
                <div className="card flex justify-content-center h-[63%]">
                  <Dropdown
                    name="selectedUsers"
                    value={currentUsers}
                    onChange={(e) => setCurrentUsers(e.value)}
                    options={selectedUsers}
                    optionLabel="email"
                    optionValue="id"
                    placeholder="Select Project Owner"
                    id="selectFIle"
                    className="w-full md:w-20rem"
                  />
                </div>
              </div>
            </>
          </div>

          <div className="ltr:text-right rtl:text-left mt-3">
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
                  fullName: "",
                  engagement: "",
                  project: "",
                  existingProject: "No",
                  isAdmin: "No",
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
const PlaygroundUser = ({ getProjectDetails, setIsOpen }) => {
  const { isAdmin } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: "",
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
      email: formData.email,
    }

    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/create_new_user`,
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
      getProjectDetails()
      setIsOpen(false)
      setFormData({
        email: "",
      })
    } else {
    }
  }

  return (
    <div>
      <Card title="Add New User to Playground">
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
          </div>

          <div className="ltr:text-right rtl:text-left">
            <Button
              onClick={submitHandler}
              text="Submit"
              className=" text-white bg-[#6699cc]  h-min text-sm font-normal btn-sm "
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
const editableStyle = {
  boxShadow: "0px 0px 2px rgb(0 0 0 / 25%)",
  borderRadius: "5px",

  backgroundColor: "white",
}
const userOptions = [
  { label: "Project Admin", value: "pa" },
  { label: " User", value: "nu" },
]
const ProjectPostPage = () => {
  const [editingIndex, setEditingIndex] = useState(-1)
  const [adminData, setAdminData] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [playgroundUser, setPlaygroundUser] = useState(false)
  const [filler, setfiller] = useState("list")
  const [isLoaded, setIsLoaded] = useState(false)
  const { isAdmin } = useSelector((state) => state.auth)
  const [data, setData] = useState([])
  const [updatedValues, setUpdatedValues] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterInput, setFilterInput] = useState("")
  const [filterSelect, setFilterSelect] = useState("")
  const [columnSelect, setColumnSelect] = useState("")
  const [sortOrderBy, setSortOrderBy] = useState("")

  const [filterCreatedBefore, setFilterCreatedBefore] = useState("")
  const [filterCreatedAfter, setFilterCreatedAfter] = useState("")
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // You can add any other logic you need here, such as making an API call to fetch data for the new page
  }

  function handleEdit(index) {
    setIsEditable(true)

    setEditingIndex(index)
  }
  const handleInputChange = (event, field) => {
    const { value } = event.target

    // Store the updated value in the state
    setUpdatedValues((prevState) => ({
      ...prevState,
      [field]: value,
    }))
  }
  const handleDelete = async (projectId) => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      project_id: projectId,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/project_details`,
      myHeaders,
      body,
      "DELETE"
    )
    if (isSuccess) {
      // setEditingIndex(-1)

      getProjectDetails()
    }
  }

  const getProjectDetails = async (filter = false) => {
    // e.preventDefault()?
    setIsLoaded(true)
    setEditingIndex(-1)

    setUpdatedValues({})
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }

    let body = {
      page: "0",
      engagement: filterSelect || "",
    }

    if (filter) {
      body["page"] = 1
      setCurrentPage(1)
    }
    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/project_details`,
      myHeaders,
      {}
    )

    if (isSuccess) {
      setIsLoaded(false)
      if (data?.count) {
        setTotalPages(Math.ceil(data.count / 10))
        setData(data?.results?.project)
      } else {
        console.log(data)
      }
    } else {
      setIsLoaded(false)
    }
  }
  useEffect(() => {
    getProjectDetails()
  }, [currentPage, filterSelect])

  useEffect(() => {
    getProjectDetails()
  }, [columnSelect])

  const handleUpdate = async (projectId) => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      project_id: projectId,
    }
    let updateData = updatedValues
    body["to_update"] = updateData
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/project_details`,
      myHeaders,
      body,
      "PUT"
    )
    if (isSuccess) {
      setEditingIndex(-1)

      getProjectDetails()
    } else {
    }
  }

  useEffect(() => {
    getProjectDetails()
    // getProjects()
  }, [])

  return (
    <div>
      <ToastContainer />
      {isOpen && (
        <FormRepeater
          getProjectDetails={getProjectDetails}
          setIsOpen={setIsOpen}
        />
      )}
      {playgroundUser && (
        <PlaygroundUser
          getProjectDetails={getProjectDetails}
          setIsOpen={setPlaygroundUser}
        />
      )}

      {isLoaded && filler === "list" && <TableLoading count={4} />}
      <div className="">
        <Card className="mb-2 bg-white" noborder>
          <div className="flex justify-between  items-center">
            {!isOpen && (
              <div className="flex-none">
                <Tooltip placement="top" arrow content="Add New Project">
                  <button
                    onClick={() => {
                      setIsOpen(true)
                      setPlaygroundUser(false)
                    }}
                    className={`btn btn inline-flex justify-center  
          text-white bg-[#6699cc] h-min text-sm font-normal btn-sm`}
                  >
                    <span className="flex items-center">
                      <span className="ltr:mr-2 rtl:ml-2 text-[16px]">
                        <Icon icon={"heroicons-outline:plus-sm"} />
                      </span>

                      <span>Add Project</span>
                    </span>
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </Card>{" "}
        {filler === "list" && !isLoaded && data?.length > 0 ? (
          <Card
            title="Projects"
            noborder
            titleClass="font-semibold"
            subtitle="List Of All the Projects."
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
                    getUsers={getProjectDetails}
                  />
                </div>
              </div>
              {/* <Pagination
                className="flex justify-center mt-3"
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
              /> */}
            </div>
          </Card>
        ) : (
          <></>
        )}
        {!isLoaded && data?.length == 0 ? (
          <div className="bg-white">
            <div
              className={`
        card rounded-md  dark:bg-[#6699cc] " border border-slate-200 dark:border-slate-700"`}
            >
              <header className="card-header flex justify-center items-center ">
                <div>
                  <div className={`card-title`}>No projects Found</div>
                </div>
              </header>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  )
}

export default ProjectPostPage

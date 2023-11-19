"use client"
import Card from "@/components/ui/Card"
import Modal from "@/components/ui/Modal"
import Flatpickr from "react-flatpickr"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"

import "./ManageEmployees.css"

import React, { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import Button from "@/components/ui/Button"
import TableLoading from "@/components/skeleton/Table"
import { ToastContainer, toast } from "react-toastify"
import { apiCall } from "@/helper/api_call"
import { Icon } from "@iconify/react"
import Textinput from "@/components/ui/Textinput"
import Pagination from "@/components/ui/Pagination"
import moment from "moment"
import Radio from "@/components/ui/Radio"
import { Dropdown } from "primereact/dropdown"
const FormRepeater = ({ getUsers, setIsOpen }) => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [data, setData] = useState()
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCircle, setSelectedCircle] = useState(null)
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)

  const { isAdmin } = useSelector((state) => state.auth)

  const [engagementData, setEngagementData] = useState()
  const [newUser, setNewUser] = useState({})
  const [value, setValue] = useState("Yes")
  const [project, setProject] = useState("")
  const fetchEngagement = async () => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin?.auth}`,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/get_roles`,
      myHeaders
    )
    if (isSuccess) {
      setEngagementData(data)
    }
  }
  const fetchProjects = async () => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin?.auth}`,
    }
    let body = {
      role_id: formData?.engagement,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/get_roles`,
      myHeaders,
      body,
      "POST"
    )
    if (isSuccess) {
      setData(data)
    }
  }
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    fullName: "",
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
  const handleAddUser = (event, field) => {
    const { value } = event.target

    // Store the updated value in the state
    setNewUser((prevState) => ({
      ...prevState,
      [field]: value,
    }))
  }
  const submitHandler = async (e) => {
    e.preventDefault()
    let myHeaders = {
      authorization: `Bearer ${isAdmin?.auth}`,
    }
    let body = {
      email: formData.email,
      username: formData.userName,
      role_id: formData?.engagement,
    }
    if (formData?.engagement == "1") {
      body["user_data"] = {
        region: selectedRegion,
        circle: selectedCircle,
        cluster: selectedCluster,
        branch: selectedBranch,
      }
    } else if (formData?.engagement == "2") {
      body["user_data"] = {
        region: selectedRegion,
        circle: selectedCircle,
        cluster: selectedCluster,
      }
    } else if (formData?.engagement == "3") {
      body["user_data"] = {
        region: selectedRegion,
        circle: selectedCircle,
      }
    } else if (formData?.engagement == "4") {
      body["user_data"] = {
        region: selectedRegion,
      }
    }

    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/create_user`,
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
        userName: "",
        fullName: "",
        engagement: "",
        project: "",
        existingProject: "No",
        isAdmin: "No",
        // Default value for the radio buttons
      })
    } else {
    }
  }
  useEffect(() => {
    fetchEngagement()
  }, [])
  useEffect(() => {
    if (formData.engagement) {
      fetchProjects()
    }
  }, [formData.engagement])
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
                User Name
              </label>
              <input
                type="text"
                className={`form-control py-2 `}
                placeholder="User Name"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
              />
            </div>
            <div className={`fromGroup  `}>
              <label
                className={`block uppercase  text-slate-400 font-semibold text-[0.65rem]  lead`}
              >
                Full Name
              </label>
              <input
                type="text"
                className={`form-control py-2 `}
                placeholder="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
              Role
              <div className="card flex justify-content-center h-[63%]">
                <Dropdown
                  name="engagement"
                  value={formData?.engagement}
                  onChange={handleChange}
                  options={engagementData}
                  style={{ fontSize: "10px" }}
                  optionLabel="role"
                  optionValue="id"
                  placeholder="Select Role"
                  className="w-full   "
                />
              </div>
            </div>
            {formData.engagement && formData.engagement != "5" && (
              <>
                {data && formData?.engagement != "4" && (
                  <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                    Region
                    <div className="card flex justify-content-center h-[63%]">
                      <Dropdown
                        value={selectedRegion}
                        className="w-full   "
                        options={Object.keys(data).map((region) => ({
                          label: region,
                          value: region,
                        }))}
                        onChange={(e) => {
                          setSelectedRegion(e.value)
                          setSelectedCircle(null)
                          setSelectedCluster(null)
                        }}
                        placeholder="Select Region"
                      />
                    </div>
                  </div>
                )}
                {data && (
                  <>
                    {data && formData?.engagement == "4" && (
                      <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                        Region
                        <div className="card flex justify-content-center h-[63%]">
                          <Dropdown
                            value={selectedRegion}
                            className="w-full   "
                            options={data?.map((region) => ({
                              label: region.Region,
                              value: region.Region,
                            }))}
                            onChange={(e) => {
                              setSelectedRegion(e.value)
                              setSelectedCircle(null)
                              setSelectedCluster(null)
                            }}
                            placeholder="Select Region"
                          />
                        </div>
                      </div>
                    )}
                    {data &&
                      formData.engagement != "4" &&
                      formData.engagement == "3" &&
                      selectedRegion && (
                        <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                          Circle
                          <div className="card flex justify-content-center h-[63%]">
                            <Dropdown
                              value={selectedCircle}
                              options={data[selectedRegion].map((circle) => ({
                                label: circle,
                                value: circle,
                              }))}
                              onChange={(e) => {
                                setSelectedCircle(e.value)
                                setSelectedCluster(null)
                              }}
                              className="w-full  "
                              placeholder="Select Circle"
                            />
                          </div>
                        </div>
                      )}

                    {data &&
                      formData.engagement != "4" &&
                      formData.engagement != "3" &&
                      selectedRegion && (
                        <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                          Circle
                          <div className="card flex justify-content-center h-[63%]">
                            <Dropdown
                              value={selectedCircle}
                              options={Object.keys(data[selectedRegion]).map(
                                (circle) => ({ label: circle, value: circle })
                              )}
                              onChange={(e) => {
                                setSelectedCircle(e.value)
                                setSelectedCluster(null)
                              }}
                              className="w-full  "
                              placeholder="Select Circle"
                            />
                          </div>
                        </div>
                      )}

                    {data &&
                      formData.engagement == "1" &&
                      selectedRegion &&
                      selectedCircle && (
                        <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                          Cluster
                          <div className="card flex justify-content-center h-[63%]">
                            <Dropdown
                              value={selectedCluster}
                              options={Object.keys(
                                data[selectedRegion][selectedCircle]
                              ).map((cluster) => ({
                                label: cluster,
                                value: cluster,
                              }))}
                              onChange={(e) => setSelectedCluster(e.value)}
                              placeholder="Select Cluster"
                              className="w-full   "
                            />
                          </div>
                        </div>
                      )}
                    {data &&
                      formData.engagement == "2" &&
                      selectedRegion &&
                      selectedCircle && (
                        <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                          Cluster
                          <div className="card flex justify-content-center h-[63%]">
                            <Dropdown
                              value={selectedCluster}
                              options={data[selectedRegion][selectedCircle].map(
                                (cluster) => ({
                                  label: cluster,
                                  value: cluster,
                                })
                              )}
                              onChange={(e) => setSelectedCluster(e.value)}
                              placeholder="Select Cluster"
                              className="w-full   "
                            />
                          </div>
                        </div>
                      )}
                    {data &&
                      selectedCluster &&
                      formData.engagement == "1" &&
                      selectedRegion &&
                      selectedCircle && (
                        <div className="block  text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                          Branch
                          <div className="card flex justify-content-center h-[63%]">
                            <Dropdown
                              value={selectedBranch}
                              options={data[selectedRegion][selectedCircle][
                                selectedCluster
                              ].map((branch) => ({
                                label: branch,
                                value: branch,
                              }))}
                              onChange={(e) => setSelectedBranch(e.value)}
                              placeholder="Select Branch"
                              className="w-full   "
                            />
                          </div>
                        </div>
                      )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="ltr:text-right rtl:text-left">
            <Button
              onClick={submitHandler}
              text="Submit"
              className=" text-white btn-main  h-min text-sm font-normal btn-sm "
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

const ProjectPostPage = () => {
  const [editingIndex, setEditingIndex] = useState(-1)
  const [isEditable, setIsEditable] = useState(false)
  const [adminData, setAdminData] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [filler, setfiller] = useState("list")
  const [isLoaded, setIsLoaded] = useState(false)
  const { isAdmin } = useSelector((state) => state.auth)
  const [data, setData] = useState([])
  const [updatedValues, setUpdatedValues] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterInput, setFilterInput] = useState("")
  const [filterSelect, setFilterSelect] = useState("")
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

  const getUsers = async (filter = false) => {
    // e.preventDefault()?
    setIsLoaded(true)
    setEditingIndex(-1)
    setUpdatedValues({})
    let myHeaders = {
      authorization: `Bearer ${isAdmin?.auth}`,
    }

    let body = {
      page: currentPage,
      project_name: filterInput || "",
      engagement: filterSelect || "",
      created_at_after: filterCreatedAfter ? filterCreatedAfter : "",
      created_at_before: filterCreatedBefore ? filterCreatedBefore : "",
    }
    if (filter) {
      body["page"] = 1
      setCurrentPage(1)
    }
    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/create_user`,
      myHeaders,
      body
    )

    if (isSuccess) {
      setIsLoaded(false)
      if (data?.count) {
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
  }, [])

  return (
    <div>
      <ToastContainer />
      {isOpen && <FormRepeater getUsers={getUsers} setIsOpen={setIsOpen} />}
      <br></br>

      <div className="">
        <Card className="mb-2 bg-white" noborder>
          <div className="flex justify-between  items-center">
            <div className="flex flex-grow items-center space-x-3 md:mb-0 mb-3">
              <Textinput
                type="text"
                placeholder="Enter User Name"
                onChange={(event) => setFilterInput(event.target.value)}
                // defaultValue={value.email}
                value={filterInput}
                className="form-control py-2"
              />
              <Flatpickr
                className="form-control py-2 w-[16%]"
                placeholder=" Created Before "
                onChange={(date) => {
                  const selectedDate = moment(date[0]).format("YYYY-MM-DD")
                  setFilterCreatedBefore(selectedDate)
                }}
                id="default-picker"
              />{" "}
              <Flatpickr
                className="form-control py-2 w-[16%]"
                placeholder=" Created After "
                onChange={(date) => {
                  const selectedDate = moment(date[0]).format("YYYY-MM-DD")
                  setFilterCreatedAfter(selectedDate)
                }}
                id="default-picker2"
              />{" "}
              {/* <Flatpickr className="form-control py-2" id="default-picker" /> */}
              <Button
                icon="ci:filter"
                text="Apply Filter"
                className="text-white btn-main h-min text-sm font-normal btn-sm"
                iconClass="text-lg"
                onClick={() => {
                  getUsers(true)
                }}
              />
            </div>
            <div className="flex-none">
              <Button
                icon="heroicons-outline:plus-sm"
                text="Add User"
                className="text-white btn-main h-min text-sm font-normal btn-sm"
                iconClass="text-lg"
                onClick={() => {
                  setIsOpen(true)
                }}
              />
            </div>
          </div>
        </Card>{" "}
        {isLoaded && filler === "list" && <TableLoading count={3} />}
        {filler === "list" && !isLoaded && data?.length > 0 ? (
          <Card
            title="Users"
            noborder
            titleClass="font-semibold"
            subtitle="List Of All the Users."
          >
            <div className="overflow-x-auto -mx-5">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden ">
                  <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                    <thead className="">
                      <tr>
                        <th
                          scope="col"
                          className=" text-left px-5 text-xs   dark:bg-[#6699cc] dark:border-slate-700 "
                        >
                          User Id
                        </th>

                        <th
                          scope="col"
                          className=" text-left px-5 text-xs   dark:bg-[#6699cc] dark:border-slate-700 "
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className=" text-left px-5 text-xs   dark:bg-[#6699cc] dark:border-slate-700 "
                        >
                          User Name
                        </th>
                        <th
                          scope="col"
                          className=" text-left px-5 text-xs   dark:bg-[#6699cc] dark:border-slate-700 "
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className=" text-left px-5 text-xs   dark:bg-[#6699cc] dark:border-slate-700 "
                        >
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 dark:bg-[#6699cc] dark:divide-slate-700">
                      {data &&
                        data.map((value, index) => (
                          <tr key={index}>
                            <td className="px-5 py-3  text-xs  dark:bg-[#6699cc] dark:border-slate-700">
                              {value?.userId}
                            </td>

                            <td className="px-5 py-3  text-xs  dark:bg-[#6699cc] dark:border-slate-700">
                              {editingIndex === index ? (
                                <>
                                  <Textinput
                                    onChange={(event) =>
                                      handleInputChange(event, "email")
                                    }
                                    defaultValue={value.email}
                                    className={
                                      isEditable
                                        ? "shadow-md rounded-md bg-slate"
                                        : ""
                                    }
                                  />
                                </>
                              ) : (
                                value.email
                              )}
                            </td>
                            <td className="px-5 py-3  text-xs  dark:bg-[#6699cc] dark:border-slate-700">
                              {value?.username}
                            </td>

                            <td className="px-5 py-3  text-xs  dark:bg-[#6699cc] dark:border-slate-700">
                              {value?.role}
                            </td>
                            <td className="px-5 py-3  text-xs  dark:bg-[#6699cc] dark:border-slate-700">
                              {value?.created_at}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                className="flex justify-center"
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
              />
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
                  <div className={`card-title`}>No Users Found</div>
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

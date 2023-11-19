"use client"
import Card from "@/components/ui/Card"

import React, { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import useWidth from "@/hooks/useWidth"
import Button from "@/components/ui/Button"
import GridLoading from "@/components/skeleton/Grid"
import TableLoading from "@/components/skeleton/Table"
import { ToastContainer, toast } from "react-toastify"
import { apiCall } from "@/helper/api_call"
import { Icon } from "@iconify/react"
import useToken from "@/hooks/useToken"
import moment from "moment"

import FileIcon from "@/components/ui/FileIcon"
import Modal from "@/components/ui/Modal"
import InputGroup from "@/components/ui/InputGroup"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
const columns = [
  {
    label: "S.No",
    field: "S.No",
  },
  {
    label: "File Name",
    field: "fileName",
  },

  {
    label: "File Category",
    field: "File Category",
  },
  {
    label: "Delete File",
    field: "Delete File",
  },
]

const JiraProgressDropdown = ({ file_tags, id, file_id }) => {
  const { isAuth } = useSelector((state) => state.auth)
  const [token, setToken] = useToken()

  const backgroundColors = {
    1: "#1B4965", // Yellow
    2: "#0B7A75", // Blue
    3: "#554971", // Orange
    4: "#8A2BE2", // Purple
    5: "#2c6e49", // Green
    6: "#8c2f39", // Pink 0
    7: "#705D56", // Red 0
  }

  const updateTag = async (id) => {
    // e.preventDefault()?
    let myHeaders = {
      authorization: `Bearer ${isAuth.auth}`,

      token: token,
    }
    let body = {
      id: file_id,
      category_id: id,
    }

    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/update_file_tag`,
      myHeaders,
      body,
      "PUT"
    )
  }

  const [selectedValue, setSelectedValue] = useState(id)

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value)
    updateTag(event.target.value)
  }

  return (
    <span className="jira-dropdown ">
      <select
        value={selectedValue}
        onChange={handleSelectChange}
        className={`jira-dropdown__select badge text-xs  text-white  capitalize`}
        style={{
          backgroundColor: backgroundColors[selectedValue] || "#1B4965",
        }}
      >
        {file_tags?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </span>
  )
}

const ManageFiles = () => {
  const [viewFile, setViewFile] = useState("")
  const toastId = useRef(null)
  const [addWebsite, setAddWebsite] = useState(false)
  const [filler, setfiller] = useState("list")
  const { width, breakpoints } = useWidth()
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedFile, setSelectedFile] = useState([])
  const { isAuth } = useSelector((state) => state.auth)
  const [progressValue, setProgressValue] = useState()
  const [loadingMessage, setLoadingMessage] = useState("")
  const [rows, setRow] = useState([])
  const [tags, setTags] = useState("")
  const [token, setToken] = useToken()
  const dispatch = useDispatch()
  const handleFileChange = async (e) => {
    e.preventDefault()
    const files = e.target.files
    const filesArray = Array.from(files).map((file) => file)
    await setSelectedFile(filesArray)
  }
  const [websiteUrl, setWebsiteUrl] = useState("")
  useEffect(() => {
    if (selectedFile.length > 0) {
      handleSubmit()
    }
  }, [selectedFile])
  const handleSubmit = async (e) => {
    setProgressValue(1)
    setLoadingMessage("Uploading Files")
    const progressToastId = toast.info("Uploading Files...", {
      theme: "colored",
      progress: 0.1,
      autoClose: false, // Prevent auto-closing the toast
    })
    const formData = new FormData()
    for (const file of selectedFile) {
      formData.append("files", file)
    }
    let req = {
      authorization: `Bearer ${isAuth.auth}`,
    }

    let tokenReceived = false // Flag to track if token has been received
    if (selectedFile.length > 0) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/upload`,
          {
            method: "POST",
            body: formData,
            headers: req,
          }
        )
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let chunk = ""

        reader.read().then(function processResult(result) {
          chunk += decoder.decode(result.value, { stream: true })

          // Split chunk into individual data objects
          const dataObjects = chunk.split("\n").filter(Boolean)

          dataObjects.forEach((dataObject) => {
            // Process each data object
            const data = dataObject.replace(/^data: /, "")
            if (data.includes("token")) {
              tokenReceived = true // Set the flag to true
              setProgressValue(1)
              toast.update(progressToastId, {
                render: "Analyzing Files",

                progress: 0.1,
              })

              setLoadingMessage("Analyzing Files")
              analyze(data.split(":")[2], progressToastId)
              setToken(data.split(":")[2])
              reader.cancel()
              // setFinalAnswer(answeringContent);
              return
            }

            // Extract the value from the data
            if (data.includes("No files")) {
              tokenReceived = true
              toast.dismiss(progressToastId)
              toast.error("No files were uploaded successfully", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              })
              setProgressValue()
              setLoadingMessage("")

              reader.cancel()
              return
            } else if (data.includes("error:")) {
              const errorMessage = data.split("error:")[1].trim()

              toast.error(errorMessage, {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              })
            } else {
              setProgressValue(data.split(":")[1])
              toast.update(progressToastId, {
                render: () => (
                  <div>Uploading Files {parseInt(data.split(":")[1])}%</div>
                ),
                progress: data.split(":")[1] / 100,
              })
            }
          })

          // Continue streaming responses if token not received
          if (!tokenReceived) {
            reader.read().then(processResult)
          }
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
  const handleWebsiteData = async () => {
    setAddWebsite(false)
    let req = {
      authorization: `Bearer ${isAuth.auth}`,
    }
    let body = {
      link: websiteUrl,
    }
    let tokenReceived = false // Flag to track if token has been received
    const progressToastId = toast.info("Crawling Data...", {
      theme: "colored",
      progress: 0.1,
      autoClose: false, // Prevent auto-closing the toast
    })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/analyze_website`,
        {
          headers: req,
          body,
          method: "POST",
          body: JSON.stringify(body),
        }
      )
      setProgressValue(1)
      setLoadingMessage("Analyzing Files")
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let chunk = ""

      reader.read().then(function processResult(result) {
        chunk += decoder.decode(result.value, { stream: true })

        // Split chunk into individual data objects
        const dataObjects = chunk.split("\n").filter(Boolean)

        dataObjects.forEach((dataObject) => {
          // Process each data object
          const data = dataObject.replace(/^data: /, "")

          if (data.split(":")[1] == "100") {
            tokenReceived = true // Set the flag to true
            setProgressValue()
            setLoadingMessage("")
            toast.update(progressToastId, {
              render: "Crawl Done",
              type: "success",
              progress: 1,
              autoClose: 2000,
            })
            getFiles()
            reader.cancel()
            // setFinalAnswer(answeringContent);
            return
          }

          // Extract the value from the data
          setProgressValue(data.split(":")[1])
          toast.update(progressToastId, {
            render: () => (
              <div>Crawling Data {parseInt(data.split(":")[1])}%</div>
            ),
            progress: data.split(":")[1] / 100,
          })
        })

        // Continue streaming responses if token not received
        if (!tokenReceived) {
          reader.read().then(processResult)
        }
      })
    } catch (error) {
      console.error(error)
    }
  }
  const analyze = async (token, progressToastId) => {
    let req = {
      authorization: `Bearer ${isAuth.auth}`,

      token: token,
    }

    let tokenReceived = false // Flag to track if token has been received
    if (selectedFile.length > 0) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/analyze`,
          {
            headers: req,
          }
        )
        setProgressValue(1)
        setLoadingMessage("Analyzing Files")
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let chunk = ""

        reader.read().then(function processResult(result) {
          chunk += decoder.decode(result.value, { stream: true })

          // Split chunk into individual data objects
          const dataObjects = chunk.split("\n").filter(Boolean)

          dataObjects.forEach((dataObject) => {
            // Process each data object
            const data = dataObject.replace(/^data: /, "")

            if (data.split(":")[1] == "100") {
              tokenReceived = true // Set the flag to true
              setProgressValue()
              setLoadingMessage("")
              toast.update(progressToastId, {
                render: "Upload Done",
                type: "success",
                progress: 1,
                autoClose: 2000,
              })
              getFiles()
              reader.cancel()
              // setFinalAnswer(answeringContent);
              return
            }

            // Extract the value from the data
            setProgressValue(data.split(":")[1])
            toast.update(progressToastId, {
              render: () => (
                <div>Analyzing Files {parseInt(data.split(":")[1])}%</div>
              ),
              progress: data.split(":")[1] / 100,
            })
          })

          // Continue streaming responses if token not received
          if (!tokenReceived) {
            reader.read().then(processResult)
          }
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
  const getFiles = async (e) => {
    // e.preventDefault()?
    setIsLoaded(true)
    setRow([])
    let myHeaders = {
      authorization: `Bearer ${isAuth.auth}`,
    }

    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/all_files`,
      myHeaders
    )

    if (isSuccess) {
      setIsLoaded(false)

      if (data?.file_groups) {
        setRow(data?.file_groups)
        setTags(data?.file_tags)
      } else {
      }
      // toast.notify(`User Added Successfully`, {
      //   type: "success",
      // })
      // onClose()
    }
    // else {
    //   toast.notify(`${data.error}`, {
    //     type: "error",
    //   })
    // }
  }
  const deleteFiles = async () => {
    let req = {
      authorization: `Bearer ${isAuth.auth}`,

      token: token,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/delete_all_files`,
      req,
      {},
      "DELETE"
    )

    if (isSuccess) {
      setToken()
      getFiles()
    } else {
    }
  }
  const fileName = (row) => {
    return (
      <div className="flex-1 flex space-x-2 rtl:space-x-reverse mb-3">
        <div className="flex-none">
          <div className="h-8 w-8">
            <FileIcon fileName={row.name} />
          </div>
        </div>
        <div className="flex items-center">
          <span className="block text-slate-600 text-xs dark:text-slate-300">
            {row.name}
          </span>
        </div>
      </div>
    )
  }
  const uploadedOn = (row) => {
    return (
      <div className="flex-1 flex space-x-2 rtl:space-x-reverse mb-3">
        <div className="flex-1 flex  flex-col">
          <span className="block text-slate-600 text-xs dark:text-slate-300">
            Uploaded on {moment(row.created_at).format("DD/MM/YYYY")}
          </span>
        </div>
      </div>
    )
  }
  const deleteFile = (row) => {
    return (
      <div
        onClick={() => {
          handleDelete(row.id)
        }}
        className={`badge text-sm font-medium   bg-danger-500 text-white cursor-pointer `}
      >
        <span className="inline-flex items-center">
          <span className="inline-block ltr:mr-1 rtl:ml-1">
            <Icon icon="heroicons-outline:trash" />
          </span>
          Delete
        </span>
      </div>
    )
  }
  const fileCategory = (row) => {
    return (
      <JiraProgressDropdown
        file_tags={tags}
        id={row.category_id}
        file_id={row.id}
      />
    )
  }
  const handleDelete = async (id) => {
    setIsLoaded(true)
    let myHeaders = {
      authorization: `Bearer ${isAuth.auth}`,

      token: token,
    }
    let body = {
      id: id,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/delete_single_file`,
      myHeaders,
      body,
      "DELETE"
    )
    if (isSuccess) {
      if (data?.tokenMessage) {
        setToken()
      }
      getFiles()
    }
  }

  useEffect(() => {
    getFiles()
  }, [token])
  const indexTemplate = (rowData, { rowIndex }) => {
    return <>{rowIndex + 1}</>
  }
  return (
    <div>
      <ToastContainer />
      <Modal
        title="Add website Url"
        activeModal={addWebsite}
        className="max-w-2xl"
        onClose={() => {
          setAddWebsite(false)
        }}
      >
        <div className="space-y-3">
          <InputGroup
            type="text"
            label="Website URL"
            placeholder="Enter Website URL"
            onChange={(e) => setWebsiteUrl(e.target.value)}
            value={websiteUrl}
            append={
              <Button
                text="Crawl Website"
                className="btn bg-[#6699cc] dark:bg-blue-600 text-white "
                onClick={() => handleWebsiteData()}
              />
            }
          />
        </div>
      </Modal>

      <br></br>

      {isLoaded && filler === "list" && <TableLoading count={4} />}
      {filler === "list" && !isLoaded && rows ? (
        <div>
          {Object.keys(rows).map((value) => (
            <div className="mb-4">
              <Card
                title={"Manage Files"}
                noborder
                titleClass="font-semibold"
                headerslot={
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="mr-2 text-danger-500 text-xs">
                      {/* <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
            Manage Files
          </h4> */}
                    </div>
                    <div>
                      <div
                        className={`${
                          width < breakpoints.md ? "space-x-rb" : ""
                        } md:flex md:space-x-4 md:justify-end items-center rtl:space-x-reverse`}
                      >
                        {Object.keys(rows).length > 0 ? (
                          <Button
                            onClick={() => {
                              deleteFiles()
                              // handleDelete(row.id)
                            }}
                            className={`
                
                       bg-danger-500 text-danger-500 bg-opacity-30 dark:text-white   hover:bg-opacity-100 hover:text-white

                   w-full border-b border-b-gray-500 border-opacity-10 text-sm  last:mb-0 cursor-pointer 
                   first:rounded-t last:rounded-b flex  space-x-2 items-center rtl:space-x-reverse `}
                          >
                            <span className="text-base">
                              <Icon icon="heroicons-outline:trash" />
                            </span>
                            <span>Delete All Embeddings</span>
                          </Button>
                        ) : (
                          ""
                        )}
                        <input
                          id="manageFile"
                          type="file"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          multiple
                        />
                        <div>
                          <Button
                            icon="heroicons-outline:plus"
                            text="Upload Files"
                            className="text-white bg-[#6699cc] dark:bg-blue-600  h-min text-sm font-normal"
                            iconClass=" text-lg"
                            onClick={() =>
                              document.getElementById("manageFile").click()
                            }
                          />

                          <div
                            className={`${
                              width < breakpoints.md ? "space-x-rb" : ""
                            } md:flex md:space-x-4 md:justify-end items-center rtl:space-x-reverse`}
                          ></div>

                          <div></div>
                        </div>
                        {/* Commented for now, but will be added later */}
                        <Button
                          icon="heroicons-outline:plus"
                          text="Add Website"
                          className="text-white bg-[#6699cc] dark:bg-blue-600  h-min text-sm font-normal"
                          iconClass=" text-lg"
                          onClick={() => setAddWebsite(true)}
                        />
                      </div>
                      <div className=" mt-2 ">
                        <div className="flex flex-col"></div>
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="overflow-x-auto shadow-base card rounded-md p-6">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden ">
                      <DataTable
                        editMode="row"
                        value={rows[value].files}
                        dataKey="id"
                        stripedRows
                        // pt={{
                        //   datatable: {
                        //     root: ({ props }) => ({
                        //       className: "!flex flex-col h-full !bg-slate-700",
                        //     }),
                        //   },
                        //   thead: {
                        //     root: {
                        //       className: "!bg-teal-400 !border-teal-400 ",
                        //     },
                        //     th: {
                        //       className: "!bg-teal-400",
                        //     },
                        //   },
                        //   headerRow: {
                        //     className: "dark:!bg-slate-700",
                        //   },
                        // }}
                      >
                        {/* <Column body={indexTemplate} header="#" style={{ width: "50px" }} /> */}

                        <Column
                          // field="user_id"
                          header="S.No"
                          style={{ width: "10%" }}
                          body={indexTemplate}
                          pt={{
                            headerCell: {
                              root: ({ context }) => ({
                                className:
                                  "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
                              }),
                            },

                            bodyCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300 !text-sm",
                            },
                            columnTitle: {
                              className: "dark:!bg-slate-700",
                            },
                            headerContent: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm flex justify-start ",
                            },
                            sortIcon: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm !w-3 ",
                            },
                          }}
                        ></Column>
                        <Column
                          field="fileName"
                          body={fileName}
                          header="File Name"
                          style={{ width: "30%", height: "1px" }}
                          pt={{
                            headerCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
                            },
                            bodyCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300 !text-sm",
                            },
                            columnTitle: {
                              className: "dark:!bg-slate-700",
                            },
                            headerContent: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm flex justify-start ",
                            },
                            sortIcon: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm  !w-3",
                            },
                          }}
                        ></Column>
                        <Column
                          field="fileName"
                          body={uploadedOn}
                          header="Uploaded On"
                          style={{ width: "20%", height: "1px" }}
                          pt={{
                            headerCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
                            },
                            bodyCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300 !text-sm",
                            },
                            columnTitle: {
                              className: "dark:!bg-slate-700",
                            },
                            headerContent: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm flex justify-start ",
                            },
                            sortIcon: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm  !w-3",
                            },
                          }}
                        ></Column>

                        <Column
                          field="fileName"
                          body={fileCategory}
                          header="File Category"
                          style={{ width: "20%", height: "1px" }}
                          pt={{
                            headerCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
                            },
                            bodyCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300 !text-sm",
                            },
                            columnTitle: {
                              className: "dark:!bg-slate-700",
                            },
                            headerContent: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm justify-start flex ",
                            },
                            sortIcon: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm  !w-3",
                            },
                          }}
                        ></Column>
                        <Column
                          field="fileName"
                          body={deleteFile}
                          header="Delete File"
                          style={{ width: "10%", height: "1px" }}
                          pt={{
                            headerCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
                            },
                            bodyCell: {
                              className:
                                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300 !text-sm",
                            },
                            columnTitle: {
                              className: "dark:!bg-slate-700",
                            },
                            headerContent: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm justify-start flex ",
                            },
                            sortIcon: {
                              className:
                                "!text-[#002b49] dark:!text-white !text-sm  !w-3",
                            },
                          }}
                        ></Column>
                      </DataTable>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
      {!isLoaded && rows.length == 0 ? (
        <>
          <div
            className={`${
              width < breakpoints.md ? "space-x-rb" : ""
            } md:flex md:space-x-4 md:justify-end items-center rtl:space-x-reverse mb-3`}
          >
            {Object.keys(rows).length > 0 ? (
              <Button
                onClick={() => {
                  deleteFiles()
                  // handleDelete(row.id)
                }}
                className={`
                
                       bg-danger-500 text-danger-500 bg-opacity-30 dark:text-white   hover:bg-opacity-100 hover:text-white

                   w-full border-b border-b-gray-500 border-opacity-10 text-sm  last:mb-0 cursor-pointer 
                   first:rounded-t last:rounded-b flex  space-x-2 items-center rtl:space-x-reverse `}
              >
                <span className="text-base">
                  <Icon icon="heroicons-outline:trash" />
                </span>
                <span>Delete All Embeddings</span>
              </Button>
            ) : (
              ""
            )}
            <input
              id="manageFile"
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
              multiple
            />
            <div>
              <Button
                icon="heroicons-outline:plus"
                text="Upload Files"
                className="text-white bg-[#6699cc] dark:bg-blue-600  h-min text-sm font-normal"
                iconClass=" text-lg"
                onClick={() => document.getElementById("manageFile").click()}
              />

              <div
                className={`${
                  width < breakpoints.md ? "space-x-rb" : ""
                } md:flex md:space-x-4 md:justify-end items-center rtl:space-x-reverse`}
              ></div>

              <div></div>
            </div>
            <Button
              icon="heroicons-outline:plus"
              text="Add Website"
              className="text-white bg-[#6699cc] dark:bg-blue-600  h-min text-sm font-normal"
              iconClass=" text-lg"
              onClick={() => setAddWebsite(true)}
            />
          </div>
          <div className="bg-white">
            <div
              className={`
        card rounded-md  dark:bg-slate-800 " border border-slate-200 dark:border-slate-700"`}
            >
              <header className="card-header flex justify-center items-center ">
                <div>
                  <div className={`card-title`}>No Files Found</div>
                </div>
              </header>
              <main className={`card-body`}>
                <div className="left-0 2xl:bottom-[-160px] bottom-[-130px] items-center flex justify-center  z-[-1]">
                  <img
                    src="/assets/images/svg/nofilesfound.svg"
                    alt=""
                    style={{ width: "50%" }}
                    className="object-contain"
                  />
                </div>
              </main>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  )
}

export default ManageFiles

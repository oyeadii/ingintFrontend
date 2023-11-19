import React, { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import useWidth from "@/hooks/useWidth"
import Icon from "@/components/ui/Icon"
import fetch from "node-fetch"
import Switch from "@/components/ui/Switch"
import { apiCall } from "@/helper/api_call"
import useToken from "@/hooks/useToken"
import { toast } from "react-toastify"
import { ChatSendIcon } from "@/components/ui/ChatIcons"
import Tooltip from "@/components/ui/Tooltip"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/chat/ui/button"
import { IconArrowRight, IconPlus } from "@/components/chat/ui/icons"
import { handleCustomizer } from "@/store/layoutReducer"
import InitialsName from "./InitialsName"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import { Dropdown } from "primereact/dropdown"
import { MultiSelect } from "primereact/multiselect"
import dynamic from "next/dynamic"
import performStreamedRequest from "@/helper/streamingService"
import Markdown from "./Markdown"
const Joyride = dynamic(() => import("react-joyride"), { ssr: false })

const exampleMessages = [
  {
    heading: "Upload Your Files",
    message: `What is a "serverless function"?`,
  },
  {
    heading: "Select The File You want to Use",
    message: "Summarize the following article for a 2nd grader: \n",
  },
  {
    heading: "Type Your Query and Press Enter",
    message: `Draft an email to my boss about the following: \n`,
  },
]
const time = () => {
  const date = new Date()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "pm" : "am"
  const hours12 = hours % 12 || 12
  const minutesStr = minutes < 10 ? "0" + minutes : minutes
  return hours12 + ":" + minutesStr + " " + ampm
}

const SearchGPTChat = () => {
  const [run, setRun] = useState(false)

  const steps = [
    {
      target: "#subUseCase",
      disableBeacon: true,
      spotlightClicks: true,
      styles: {
        options: {
          zIndex: 10000,
        },
      },

      content: (
        <div className="flex items-start flex-col">
          <span> Welcome to Ingint FileGPT!" </span>
          <p>
            You Can <span className="font-bold">Ask Questions </span> on your
            Files
          </p>
          <p className="flex items-start flex-col mt-2">
            <span className="font-semibold">How to Use</span>
            <span>1.Upload Files to get started</span>
            <p>2.Select a Specific File(s) if you want</p>
            <span>3.Ask Questions About the File(s) in the input</span>
          </p>
        </div>
      ),
    },
    {
      target: "#selectGPT",
      content: "You can switch Between FileGPT and ChatGPT",
      placement: "right-start",
    },
    {
      target: "#selectFIle",
      content:
        "Select the file(s) if you want. By Default all files are selected",
      placement: "right-start",
    },
    {
      target: "#uploadButton",
      content: "You can also upload new file",
      placement: "top",
      placementBeacon: "top",
      isFixed: false,
      offset: 10,
      styles: {
        options: {
          zIndex: 10000,
        },
      },
    },
    {
      target: "#input",
      content: "Type in your query",
      placement: "bottom",
      isFixed: false,
    },

    {
      target: "#sendButton",
      content: " Hit Submit and you response will start generating ",
      placement: "top",
      styles: {
        options: {
          zIndex: 10000,
          top: "-34px",
          left: "-153px",
        },
      },
    },
  ]
  const [token, setToken] = useToken()
  const [files, setFiles] = useState()

  const { width, breakpoints } = useWidth()
  const dispatch = useDispatch()
  const [answeringContent, setAnsweringContent] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [m, setM] = useState("")
  const [selectedFile, setSelectedFile] = useState([])

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [context, setContext] = useState("")
  const [fileName, setFileName] = useState(false)
  const [currentFile, setCurrentFile] = useState()

  const { isAuth } = useSelector((state) => state.auth)
  const [chat, setChat] = useState(false)
  useEffect(() => {
    !chat ? setMessages([]) : setM("")
  }, [chat])
  const [message, setMessage] = useState("")
  const handleSendMessage = async (input) => {
    setInput(input)
    let header = {
      authorization: `Bearer ${isAuth.auth}`,

      "Content-Type": "application/json",
    }
    setAnsweringContent("&ZeroWidthSpace;")

    let updatedMessages
    if (messages.length < 3) {
      updatedMessages = [...messages, { role: "user", content: input }]
    } else {
      updatedMessages = [
        ...messages.slice(-2),
        { role: "user", content: input },
      ]
    }
    setMessages([
      ...messages,
      {
        role: "user",
        content: input,
      },
    ])

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/chat_gpt`,
        {
          method: "POST",
          headers: header,
          body: JSON.stringify({ messages: updatedMessages }),
        }
      )
      if (response.status === 401) {
        throw new Error("Unauthorized")
      }
      if (response.status === 400) {
        const errorResponse = await response.json()
        const { errorCode, errorMessage } = errorResponse

        throw new Error(errorMessage || "Bad Request")
      }

      setMessages([
        ...messages,
        {
          role: "user",
          content: input,
        },
        {
          content: "",
          answering: true,
          role: "assistant",
        },
      ])
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let chunk = ""
      let contents = ""

      let isConversationFinished = false // Flag variable
      let shouldStoreNextDataObject = false // Flag to indicate whether to store the next data object

      reader.read().then(function processResult(result) {
        chunk += decoder.decode(result.value, { stream: true })

        // Split chunk into individual data objects
        const dataObjects = chunk.split("\n").filter(Boolean)

        // Reset contents before processing new data objects
        contents = ""

        // Process each data object
        dataObjects.forEach((dataObject, index) => {
          // Process each data object except for the last one if it's incomplete
          if (!(index === dataObjects.length - 1 && !result.done)) {
            const data = dataObject.replace(/^data: /, "")

            if (data === "[DONE]") {
              isConversationFinished = true // Set the flag to true
              setAnsweringContent("")
              setMessages((prev) =>
                prev.map((i) => {
                  const { answering, ...rest } = i
                  if (answering) {
                    return {
                      ...rest,
                      content: contents,
                    }
                  }
                  return i
                })
              )
              setInput("")

              reader.cancel()
            } else if (data === "[CONTEXT]") {
              try {
                if (setSource) {
                  shouldStoreNextDataObject = true
                }
                // Conditionally store the context data based on specific cases
              } catch (error) {
                console.error("Invalid JSON:", error)
              }
            } else {
              try {
                const jsonData = JSON.parse(data)
                if (jsonData.choices) {
                  // Get content of Dave's response
                  let daveResponse = jsonData.choices[0].delta.content

                  // Append Dave's response to contents if it exists
                  if (daveResponse) {
                    contents += daveResponse
                    setAnsweringContent(contents)
                  }
                }
              } catch (error) {
                console.error("Invalid JSON:", error)
              }
            }
          }
        })

        // Set the updated contents

        // Continue streaming responses
        if (!isConversationFinished) {
          reader.read().then(processResult)
        }
      })
    } catch (error) {
      if (error.message === "Unauthorized") {
        localStorage.clear()
        toast.error("Session expired. Please log in again", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
        setTimeout(() => {
          window.location.assign("/")
        }, 2000)
      } else {
        toast.error(error.message || "An error occurred. Please try again.", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }
    }

    if (message.trim()) {
      setMessage("")
    }
  }
  const dealResponse = async (e) => {
    setInput(input)

    let header = {
      authorization: `Bearer ${isAuth.auth}`,

      token: token,
      "Content-Type": "application/json",
    }
    let body = {
      prompt: input,
      sub_use_case: "filegpt",
      selected_ids: currentFile,
    }
    const progressToastId = toast.info("Generating Response...", {
      theme: "colored",

      autoClose: false, // Prevent auto-closing the toast
    })
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/file_gpt_query`
      const headers = header // Update with your actual headers
      const requestBody = body // Replace with your actual request body
      const handleDataUpdate = (contents) => {
        // Update the UI or perform any necessary actions with the received data
        setM(contents)
      }

      performStreamedRequest(
        apiUrl,
        headers,
        requestBody,
        handleDataUpdate,
        "",
        progressToastId
      )
    } catch (error) {
      console.error(error)
    }
  }
  const getFiles = async (e) => {
    // e.preventDefault()?
    let myHeaders = {
      authorization: `Bearer ${isAuth.auth}`,
    }

    //
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/file_gpt`,
      myHeaders
    )

    if (isSuccess) {
      setFiles(data)
    }
  }
  const handleFileChange = async (e) => {
    e.preventDefault()
    const files = e.target.files
    const filesArray = Array.from(files).map((file) => file)
    await setSelectedFile(filesArray)
  }
  const handleSubmit = async (e) => {
    const formData = new FormData()
    for (const file of selectedFile) {
      formData.append("file", file)
    }
    let req = {
      authorization: `Bearer ${isAuth.auth}`,
    }

    if (selectedFile.length > 0) {
      try {
        const progressToastId = toast.info("File upload in progress...", {
          theme: "colored",

          autoClose: false, // Prevent auto-closing the toast
        })

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/file_gpt`,
          {
            method: "POST",
            body: formData,
            headers: req,
          }
        )
        toast.dismiss(progressToastId)

        if (response.status === 200) {
          toast.success("File uploaded successfully.", { theme: "colored" })
          getFiles()
        } else {
          const errorResponse = await response.json()
          const { errorCode, errorMessage } = errorResponse
          throw new Error(
            errorMessage || "An error occurred. Please try again."
          )
        }
      } catch (error) {
        console.error(error)
        toast.error(error.message || "An error occurred. Please try again.", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }
    }
  }
  useEffect(() => {
    getFiles()
    if (isAuth?.is_first) {
      setRun(true)
    }
  }, [token])
  useEffect(() => {
    let element = document.getElementById("chat-box")
    if (!element) return

    element.scrollIntoView({
      block: "start",
      inline: "nearest",
    })
  }, [messages, answeringContent, m])
  useEffect(() => {
    if (apiKey) handleSendMessage(input)
  }, [apiKey])
  const containerRef = useRef(null)

  // Function to scroll to the bottom of the container
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  // Call scrollToBottom whenever you receive new responses
  useEffect(() => {
    scrollToBottom()
  }, [messages, answeringContent, m])

  const setCustomizer = (val) => dispatch(handleCustomizer(val))

  useEffect(() => {
    setCustomizer(false)
  }, [])

  useEffect(() => {
    if (selectedFile.length > 0) {
      handleSubmit()
    }
  }, [selectedFile])
  const handleJoyrideCallback = (data) => {
    const { status, type } = data
    const finishedStatuses = ["finished", "skipped"]
    if (finishedStatuses.includes(status)) {
      setRun(false)
    }
  }
  return (
    <>
      {run && (
        <Joyride
          steps={steps}
          continuous={true}
          showProgress={true}
          showSkipButton={true}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: "#ff9900",
            },
          }}
        />
      )}
      <div
        id="subUseCase"
        className=" flex space-x-5    rtl:space-x-reverse overflow-hidden"
      >
        {/* <div
          className={`transition-all duration-150 flex-none min-w-[260px] 
    ${
      width < breakpoints.lg
        ? "absolute h-full top-0 md:w-[260px] w-[200px] z-[999]"
        : "flex-none min-w-[260px]"
    }
    ${width < breakpoints.lg && false ? "left-0 " : "-left-full "}
    `}
        >
          <Card
            bodyClass="py-3  px-2 h-[97vh] overflow-auto flex flex-col max-w-xs gap-2"
            className="h-full bg-white"
            subtitle={"My Files"}
            noborder
            headerslot={
              <div className="flex items-center">
                <Tooltip placement="top" arrow content="Upload New File">
                  <button
                    onClick={() =>
                      document.querySelector('input[type="file"]').click()
                    }
                  >
                    <Icon icon="zondicons:add-outline" />
                  </button>
                </Tooltip>
              </div>
            }
          >
            

            {files?.map((item, i) => (
              <div className="shadow-base card rounded-md p-2">
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <div className="flex-none flex-shrink-0">
                    <div className="h-8 w-8">
                      <FileIcon fileName={item.name} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {" "}
                   
                    <span className="block white-space-nowrap overflow-hidden text-overflow-ellipsis text-slate-600 text-sm dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <Switch />
                </div>
              </div>
            ))}
          </Card>
        </div> */}
        {/* main message body*/}
        <div className="flex   w-full  flex-col items-center overflow-hidden">
          {/* <div className="flex flex-col">
            <div className="flex justify-center">
              <div className="rounded-md border relative border-slate-300 p-1 dark:border-slate-300/20">
                <div className="flex text-xs font-semibold leading-5">
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setChat(false)
                    }}
                    className={`w-auto cursor-pointer flex rounded-md py-1 px-3   ${
                      chat
                        ? " text-slate-800 dark:text-slate-200"
                        : "bg-[#6699cc] dark:bg-blue-600 px-3  text-white dark:text-slate-200"
                    } focus:outline-none`}
                  >
                    FileGPT
                  </div>

                  <button
                    onClick={() => setChat(true)}
                    className={`rounded-md px-3 py-1  focus:outline-none ${
                      chat
                        ? "bg-[#6699cc] dark:bg-blue-600   text-white dark:text-slate-200"
                        : " text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    ChatGPT
                  </button>
                </div>
              </div>
            </div>
          </div> */}
          {/* Prompt Messages */}
          {(messages.length > 0 || m) && (
            <div
              ref={containerRef}
              className="flex flex-col max-w-2xl min-w-[42rem] relative app_height   overflow-y-auto rounded-xl  p-4 text-sm leading-6 text-slate-900   dark:text-slate-300 sm:text-base sm:leading-7"
            >
              <div className="mb-4 flex justify-between  rounded-xl 50  dark:bg-slate-900 sm:px-4 top-8 fixed w-full max-w-2xl">
                <div className="font-bold"> {chat ? "ChatGPT" : "FileGPT"}</div>
                <div className="flex max-w-2xl items-center justify-right   rounded-xl">
                  <Tooltip placement="top" arrow content="New chat">
                    <button
                      onClick={() => {
                        if (chat) {
                          setMessages([])
                        } else {
                          setM("")
                        }
                      }}
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        " left-3 top-4 mr-5 dark:border-slate-600 dark:bg-slate-800 bg-white font-bold  "
                      )}
                    >
                      <Icon icon="material-symbols:delete-outline" />
                      New Chat
                    </button>
                  </Tooltip>
                </div>
              </div>
              {chat
                ? messages.map((item, i) => (
                    <>
                      {item.role == "assistant" && (
                        <div className="mb-4 flex rounded-xl shadow-lg bg-white dark:bg-slate-800 px-2 py-6  sm:px-4">
                          <img
                            className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                            src="/assets/images/logo/logo.png"
                          />

                          <div className="flex max-w-2xl items-center rounded-xl">
                            <Markdown
                              value={
                                item?.answering
                                  ? answeringContent
                                  : item?.content
                              }
                            />
                          </div>
                        </div>
                      )}
                      {item.role == "user" && (
                        <div className="mb-4 flex rounded-xl shadow-lg bg-white px-2 py-6 dark:bg-slate-800 sm:px-4">
                          <InitialsName />

                          <div className="flex max-w-2xl items-center rounded-xl">
                            {item.content}
                          </div>
                        </div>
                      )}
                    </>
                  ))
                : m && (
                    <>
                      {input && (
                        <div className="mb-4 flex rounded-xl shadow-lg bg-white px-2 py-6 dark:bg-slate-800 sm:px-4">
                          <InitialsName />

                          <div className="flex max-w-2xl items-center rounded-xl">
                            {input}
                          </div>
                        </div>
                      )}
                      {m && (
                        <>
                          <div className="mb-4 flex rounded-xl shadow-lg bg-white px-2 py-6 dark:bg-slate-800 sm:px-4">
                            <img
                              className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                              src="/assets/images/logo/logo.png"
                            />

                            <div className="flex max-w-2xl items-center rounded-xl">
                              <Markdown value={m} />
                            </div>
                            <div id="chat-box"></div>
                          </div>
                        </>
                      )}
                    </>
                  )}
            </div>
          )}

          {chat
            ? messages.length === 0 && (
                <>
                  <div className="mx-auto min-w-[42rem] max-w-2xl px-4">
                    <div className="rounded-lg border dark:border-slate-600 bg-white dark:bg-slate-800 px-8  pb-4 pt-4">
                      <div className="flex flex-col pb-4">
                        <div className="flex justify-center">
                          <div className="rounded-md border relative border-slate-300 p-1 dark:border-slate-300/20">
                            <div className="flex text-xs font-semibold leading-5">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  setChat(false)
                                }}
                                className={`w-auto cursor-pointer flex rounded-md py-1 px-3   ${
                                  chat
                                    ? " text-slate-800 dark:text-slate-200"
                                    : "bg-[#6699cc] dark:bg-blue-600 px-3  text-white dark:text-slate-200"
                                } focus:outline-none`}
                              >
                                FileGPT
                              </div>

                              <button
                                onClick={() => setChat(true)}
                                className={`rounded-md px-3 py-1  focus:outline-none ${
                                  chat
                                    ? "bg-[#6699cc] dark:bg-blue-600   text-white dark:text-slate-200"
                                    : " text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                ChatGPT
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h1 className="mb-2 text-lg font-semibold relative">
                        <Tooltip placement="top" arrow content="Help me">
                          <button
                            onClick={() => setRun(true)}
                            className={cn(
                              buttonVariants({
                                size: "sm",
                                variant: "outline",
                              }),
                              "absolute top-[-60px] right-[-14px] h-8 w-8 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 shadow-lg p-0 "
                            )}
                          >
                            ?
                          </button>
                        </Tooltip>
                      </h1>
                    </div>
                    <div className="  pt-2 mt-1">
                      {/* <p className="mb-2 leading-normal text-muted-foreground">
                    Leverage the power of Ingint to enhance your due
                    diligence process .
                  </p> */}
                    </div>
                  </div>
                </>
              )
            : !m && (
                <>
                  <div className="mx-auto max-w-2xl px-4 min-w-[42rem]">
                    <div className="rounded-lg border bg-white dark:border-slate-600 dark:bg-slate-800 px-8  pb-4 pt-4">
                      <div className="flex flex-col pb-4">
                        <div className="flex justify-center"></div>
                      </div>

                      <h1 className="mb-2 text-lg font-semibold relative">
                        Welcome to Ingint AI FileGPT!
                      </h1>

                      <div className="mt-4 flex flex-col items-start space-y-2"></div>
                      <MultiSelect
                        value={currentFile}
                        onChange={(e) => {
                          setCurrentFile(e.value)
                        }}
                        options={files}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select  Files"
                        maxSelectedLabels={3}
                        id="selectFIle"
                        className="w-full md:w-20rem"
                      />
                      <p className="font-bold text-[0.7rem] mt-1">
                        {" "}
                        File Types:PDF, DOCX, XLSX,CSV(password protected files
                        will error out)
                      </p>
                    </div>
                  </div>
                </>
              )}
          {/* Prompt message input */}
          <div id="chat-box"></div>

          <div className="chat-input-container">
            <form>
              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />{" "}
              <div className="chat-inner-input">
                <Tooltip
                  placement="top"
                  arrow
                  content={chat ? "Available For FileGPT" : "Upload New File"}
                >
                  <button
                    id="uploadButton"
                    onClick={() => {
                      if (!chat) {
                        document.querySelector('input[type="file"]').click()
                      }
                    }}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      `absolute left-0 top-4 h-8 w-8 dark:border-slate-600 rounded-full  p-0 sm:left-4 ${
                        chat ? "opacity-40 cursor-not-allowed" : ""
                      }`
                    )}
                  >
                    <IconPlus />
                  </button>
                </Tooltip>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (chat) {
                        handleSendMessage(input)
                      } else {
                        dealResponse(input)
                      }
                    }
                  }}
                  className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                  placeholder="Enter your prompt"
                  rows="1"
                  required
                ></textarea>
                <Tooltip
                  placement="top"
                  arrow
                  content={
                    !chat
                      ? currentFile
                        ? "Send Message"
                        : "Please Select a File(s)"
                      : "Send Message"
                  }
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      if (chat) {
                        handleSendMessage(input)
                      } else {
                        if (currentFile) {
                          dealResponse(input)
                        }
                      }
                    }}
                    type="submit"
                    id="sendButton"
                    className={`send-button ${
                      !chat
                        ? currentFile
                          ? ""
                          : "opacity-40 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ChatSendIcon />{" "}
                  </button>
                </Tooltip>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchGPTChat

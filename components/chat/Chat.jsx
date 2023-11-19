import React, { Fragment, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { handleCustomizer } from "@/store/layoutReducer"
import useSidebar from "@/hooks/useSidebar"
import Card from "@/components/ui/Card"
import {
  ChatCopyIcon,
  ChatMicIcon,
  ChatSendIcon,
  ChatThumsDownIcon,
  ChatThumsUpIcon,
} from "@/components/ui/ChatIcons"
import { ToastContainer, toast } from "react-toastify"
import Icon from "@/components/ui/Icon"
import Markdown from "@/components/chat/Markdown"
import performStreamedRequest from "@/helper/streamingService"
const suggestions = [
  "Which branch  has perfoemed well in the past?",
  "Which are top 5 customers i should contact? and give reasons also",
  "Can you prepare me a chart which shows branch level performance for IPG ?",
  "Which Customers are my best chances to convert ?",
]
const Chat = () => {
  const [collapsed, setMenuCollapsed] = useSidebar()
  const [menuHover, setMenuHover] = useState(false)
  const [messages, setMessages] = useState()
  const [answeringContent, setAnsweringContent] = useState("")
  const [input, setInput] = useState("")

  const isOpen = useSelector((state) => state.layout.customizer)
  const dispatch = useDispatch()

  const { isAuth } = useSelector((state) => state.auth)

  const dealResponse = async (prompt) => {
    setMessages()
    setInput(prompt)
    const progressToastId = toast.info("Generating Response...", {
      theme: "colored",

      autoClose: false, // Prevent auto-closing the toast
    })
    let req = {
      authorization: `Bearer ${isAuth.auth}`,
    }
    let body = { prompt: prompt }
    try {
      const url = `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/db_gpt`
      const headers = req // Update with your actual headers
      const requestBody = body // Replace with your actual request body
      const handleDataUpdate = (contents) => {
        // Update the UI or perform any necessary actions with the received data
        setMessages(contents)
      }

      performStreamedRequest(
        url,
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
  // ** Toggles  Customizer Open
  const setCustomizer = (val) => dispatch(handleCustomizer(val))
  const [openDrop, setOpenDrop] = useState(false)
  useEffect(() => {
    let element = document.getElementById("chat-box")
    if (!element) return

    element.scrollIntoView({
      block: "start",
      inline: "nearest",
    })
  }, [messages, answeringContent])
  return (
    <>
      <ToastContainer toastStyle={{ backgroundColor: "#97144d" }} />
      {!isOpen ? (
        <span
          id="chatGpt"
          className="fixed ltr:md:right-[-42px] ltr:right-0 rtl:left-0 rtl:md:left-[-32px] top-1/2 z-[888] translate-y-1/2 bg-background text-slate-50 dark:bg-slate-700 dark:text-slate-300 cursor-pointer transform rotate-90 flex items-center text-sm font-medium px-2 py-2 shadow-deep ltr:rounded-b rtl:rounded-t"
          onClick={() => setCustomizer(true)}
        >
          <Icon
            icon="material-symbols:chat"
            className="text-slate-50 text-lg animate-pulse"
          />
          <span className="hidden md:inline-block ltr:ml-2 rtl:mr-2">
            SearchGPT
          </span>
        </span>
      ) : (
        <div
          className={`sidebar-warapper bg-white dark:bg-slate-800 top-[57px]   ${
            !isOpen
              ? "w-[1px] close_sidebar"
              : collapsed
              ? "w-[1200px]"
              : "w-[400px]"
          }
    ${menuHover ? "sidebar-hovered" : ""}
   
    `}
        >
          {/* Prompt Messages Container - Modify the height according to your need */}
          <div
            className="flex relative h-[90vh] w-full flex-col text-sm"
            id="chat"
          >
            <div>
              <div className="absolute left-2 top-3">
                <div
                  onClick={() => setMenuCollapsed(true)}
                  className={`h-4 w-4 border-[1.5px] flex items-center rounded-full cursor-pointer border-slate-50 dark:border-slate-900  transition-all duration-150
                ring-black-900 dark:ring-slate-400  bg-background text-white dark:bg-slate-900  dark:ring-offset-slate-700
            `}
                >
                  <Icon icon="mdi:chevron-left" />
                </div>
              </div>
              <div className="absolute left-7 top-3">
                <div
                  onClick={() => {
                    if (collapsed) {
                      setMenuCollapsed(false)
                    } else {
                      setCustomizer(false)
                    }
                  }}
                  className={`h-4 w-4 border-[1.5px] flex items-center rounded-full cursor-pointer border-slate-50 dark:border-slate-900  transition-all duration-150
                ring-black-900 dark:ring-slate-400  bg-background text-white dark:bg-slate-900  dark:ring-offset-slate-700
            `}
                >
                  <Icon icon="mdi:chevron-right" />
                </div>
              </div>
            </div>
            <div className="absolute right-2 top-3">
              <div
                onClick={() => {
                  setMessages()
                  setInput("")
                }}
                className={`h-5 w-5 justify-center border-[1.5px] flex items-center rounded-full cursor-pointer border-slate-50 dark:border-slate-900  transition-all duration-150
                ring-black-900 dark:ring-slate-400  bg-background text-white dark:bg-slate-900  dark:ring-offset-slate-700
            `}
              >
                <Icon icon="material-symbols:delete" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-center">
                <div className="rounded-md border relative border-slate-300 p-1 dark:border-slate-300/20">
                  <div className="flex text-xs font-semibold leading-5">
                    <div className="w-auto flex rounded-md  bg-background dark:bg-blue-600 px-3 py-1  text-white dark:text-slate-200 focus:outline-none">
                      File Bot
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Prompt Messages */}
            <div className="flex-1 overflow-y-auto rounded-xl  p-4 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300  sm:leading-7">
              <>
                {input && (
                  <div className="flex px-2 py-4 sm:px-4">
                    <img
                      className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                      src="https://dummyimage.com/256x256/363536/ffffff&text=U"
                    />

                    <div className="flex max-w-3xl items-center">
                      <p>{input}</p>
                    </div>
                  </div>
                )}
                {messages && (
                  <>
                    <div className="mb-2 flex w-full flex-row justify-end gap-x-2 text-slate-500">
                      <button className="hover:text-blue-600">
                        <ChatThumsUpIcon />
                      </button>
                      <button className="hover:text-blue-600" type="button">
                        <ChatThumsDownIcon />
                      </button>
                      <button className="hover:text-blue-600" type="button">
                        <ChatCopyIcon />
                      </button>
                    </div>
                    <div className="mb-4 flex rounded-xl bg-slate-100 px-2 py-6 dark:bg-slate-900 sm:px-4">
                      <img
                        className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                        src="/assets/images/logo/logo.png"
                      />

                      <div className="flex max-w-3xl items-center rounded-xl">
                        <p>
                          {" "}
                          <Markdown value={messages} />
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>

              {!messages && !input && (
                <div className="mb-4 flex flex-col  rounded-xl bg-slate-100 px-2 py-6 dark:bg-slate-900 sm:px-4">
                  <p className="dark:text-slate-500 text-slate-500 ">
                    {" "}
                    Here are some ways File Bot can be helpful:
                  </p>
                  <div className="flex flex-col text-sm w-fit gap-2"></div>
                  {suggestions.map((value) => (
                    <div
                      onClick={() => {
                        setInput(value)
                        dealResponse(value)
                      }}
                      className={` ${
                        collapsed ? "w-fit" : ""
                      }  rounded-md bg-[#b93c72] hover:bg-background text-white px-1 py-1 dark:bg-slate-700 sm:px-4 mb-2 cursor-pointer hover:dark:bg-blue-600 hover:dark:text-white hover:bg-background hover:text-white `}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              )}

              <div id="chat-box"></div>
            </div>
            {/* Chat Box End*/}
            {/* Prompt message input */}
            <form
              className="mt-2 px-3 py-1"
              onSubmit={(e) => {
                e.preventDefault() // Prevent default form submission
                dealResponse(input)
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Enter your prompt
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-500"
                >
                  <ChatMicIcon />
                  <span className="sr-only">Use voice input</span>
                </button>
                <textarea
                  id="chat-input"
                  className="block w-full resize-none rounded-xl border-none bg-slate-100 p-4 pl-10 pr-20 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:ring-blue-500 sm:text-base"
                  placeholder="Enter your prompt"
                  rows="1"
                  required
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault() // Prevent default behavior of new line insertion
                      dealResponse(input)
                    }
                  }}
                ></textarea>
                <button
                  type="submit"
                  className="absolute bottom-2 right-2.5 rounded-lg dark:bg-blue-700 p-2 text-sm font-medium dark:text-slate-200 hover:dark:bg-blue-800 bg-background text-white focus:outline-none focus:ring-4 focus:ring-blue-300 sm:text-base"
                >
                  <ChatSendIcon />
                  <span className="sr-only">Send message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Chat

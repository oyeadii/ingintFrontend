import React, { useRef, useState } from "react"
import Icon from "@/components/ui/Icon"
import { useSelector } from "react-redux"
import useToken from "@/hooks/useToken"
import { toast } from "react-toastify"
import { apiCall } from "@/helper/api_call"
import performStreamedRequest from "@/helper/streamingService"
import Markdown from "../chat/Markdown"

const TrendQuestions = ({
  setQuestionData,
  responseId,
  questionData,
  handleQuestionChange,
  selectedFiles,
  selectedValues,
  selectedKey,
}) => {
  const [responseData, setResponseData] = useState("")

  const [editIndex, setEditIndex] = useState(null)
  const [editMode, setEditMode] = useState(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const textareaRef = useRef(null)
  const [open, setOpen] = useState(false)
  const { isAuth } = useSelector((state) => state.auth)
  const [token, setToken] = useToken()
  const [id, setId] = useState(null)
  const handleChange = (e) => {
    const { name, value } = e.target
    setQuestionAnswer((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }
  const handleAnswerChange = (value, index) => {
    const updatedTodo = [...questionData]
    updatedTodo[index].answer = value
    setQuestionData(updatedTodo)
  }
  const dealResponse = async (index) => {
    const progressToastId = toast.info("Generating Response...", {
      theme: "colored",

      autoClose: false, // Prevent auto-closing the toast
    })
    if (activeIndex != index) {
      setActiveIndex(index)
      setOpen(!open)
    }

    let header = {
      authorization: `Bearer ${isAuth.auth}`,
      "Content-Type": "application/json",

      token: token,
    }

    let body = {
      selected_ids: selectedFiles,
      commentary_type: questionData[index].value,
      file_id: responseId,
      sheet_name: selectedKey,
      table_id: selectedValues,
    }
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/trend_analysis_commentary`
      const headers = header // Update with your actual headers
      const requestBody = body // Replace with your actual request body
      const handleDataUpdate = (contents) => {
        handleAnswerChange(contents, index)
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

  const toggleAccrodian = (index) => {
    if (activeIndex == index) setActiveIndex(null)
    else setActiveIndex(index)
    setOpen(!open)
  }

  const calculateTextAreaHeight = (field) => {
    let lineHeight = 50 // Adjust this value as needed
    const lines = field.split("\n").map((line) => {
      const words = line.split(" ")
      const wordCount = words.length
      const lineCount = Math.ceil(wordCount / (textareaRef.current?.cols || 20))
      return lineCount
    })
    const lineCount = lines.reduce((total, line) => total + line, 0)

    if (lineCount > 10) {
      lineHeight = 30
    }
    return lineHeight * lineCount
  }

  return (
    <div className="space-y-5" style={{ height: "100%", overflow: "auto" }}>
      {questionData?.length > 0 ? (
        questionData?.map((item, index) => (
          <div
            className="accordion shadow-base dark:shadow-none rounded-md"
            key={index}
          >
            <div
              className={` justify-between  font-bold transition duration-150  w-full text-start text-sm text-slate-600 dark:text-slate-300 px-8 py-4 ${
                activeIndex === index
                  ? "bg-slate-50 dark:bg-slate-700 dark:bg-opacity-60 rounded-t-md "
                  : "bg-white dark:bg-slate-700  rounded-md"
              }`}
            >
              <div>
                {editIndex === index && editMode === "question" ? (
                  <textarea
                    ref={textareaRef}
                    className="form-control py-2 "
                    value={item.question}
                    name="question"
                    onChange={(e) =>
                      handleQuestionChange(e.target.value, index)
                    }
                    style={{
                      overflow: "hidden",
                      resize: "none",
                      height: calculateTextAreaHeight(item.question),
                    }}
                  />
                ) : (
                  <span
                    className="cursor-pointer text-sm"
                    onClick={() => toggleAccrodian(index)}
                  >
                    {item.question}
                  </span>
                )}
                <span className="flex-none flex justify-end space-x-2 text-secondary-500 text-sm   rtl:space-x-reverse">
                  <button
                    onClick={() => {
                      if (activeIndex != index) {
                        toggleAccrodian(index)
                      }
                      setId(index)
                      dealResponse(index)
                    }}
                    className=" bg-[#7cae9b] flex item-center badge  text-white  "
                  >
                    Generate Response
                  </button>
                </span>
              </div>
            </div>

            {activeIndex === index && (
              <div
                className={`${
                  index === activeIndex
                    ? "dark:border dark:border-slate-700 dark:border-t-0"
                    : "l"
                }   text-xs text-slate-600 font-normal bg-white dark:bg-slate-900 dark:text-slate-300 rounded-b-md`}
              >
                {editIndex === index && editMode === "answer" ? (
                  <>
                    {" "}
                    <textarea
                      ref={textareaRef}
                      className="form-control py-2 "
                      value={item.answer}
                      style={{
                        resize: "none",
                        height: calculateTextAreaHeight(item.answer),
                      }}
                      onChange={(e) =>
                        handleAnswerChange(e.target.value, index)
                      }
                    />
                  </>
                ) : (
                  <>
                    {" "}
                    <div className="px-8 py-4">
                      {index <= 1 && <Markdown value={responseData} />}
                      <Markdown value={item.answer} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white ">
          <div
            className={`
card rounded-md  dark:bg-[#6699cc]   border border-slate-200 dark:border-slate-700`}
          >
            <header className="card-header flex justify-center items-center ">
              <div>
                <div className={`card-title`}>No Questions Found</div>
              </div>
            </header>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrendQuestions

import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import React, { useEffect, useRef, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import SimpleBar from "simplebar-react"
import useWidth from "@/hooks/useWidth"
import { Dropdown } from "primereact/dropdown"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "./Trend.css"
//core
import { MultiSelect } from "primereact/multiselect"

import "primereact/resources/primereact.min.css"
import { useSelector } from "react-redux"
import { apiCall } from "@/helper/api_call"
import useToken from "@/hooks/useToken"
import TrendQuestions from "./TrendQuestions"
import PieChart from "./pie-chart"
import RevenueBarChart from "./revenue-bar-chart"
import Icon from "@/components/ui/Icon"
import Markdown from "../chat/Markdown"
const a = {
  Backlog: [1],
}
const cities = [
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" },
]
const chartOptions = [
  { label: "Stacked", value: "stacked" },
  { label: "Bar", value: "bar" },

  { label: "Pie", value: "pie" },
  { label: "Line", value: "line" },
]
const Test = () => {
  const [data, setData] = useState(a)
  const [fileData, setFileData] = useState()
  const { isAuth } = useSelector((state) => state.auth)
  const [token, setToken] = useToken()
  const [currentFile, setCurrentFile] = useState("")
  const [selectedFile, setSelectedFile] = useState([])
  const [graphData, setGraphData] = useState()
  const [selectedKey, setSelectedKey] = useState("")
  const [selectedValues, setSelectedValues] = useState("")
  const [column, setColumn] = useState()
  const toastId = useRef(null)
  const [selectedColumn, setSelectedColumn] = useState("")
  const [selectedChartType, setSelectedChartType] = useState("bar")
  const [filesData, setfilesData] = useState([])
  const [commentary, setCommentary] = useState("")
  const [m, setM] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])

  const [questionData, setQuestionData] = useState([
    { question: "Revenue Trends", value: "revenue_trends", answer: "" },
    { question: "Operational Costs", value: "operational_costs", answer: "" },
    { question: "SG&A Costs", value: "sg&a_costs", answer: "" },
    { question: "Safety KPIs", value: "safety_kpis", answer: "" },
    { question: "Quality KPI", value: "quality_kpi", answer: "" },
    { question: "Delivery KPI", value: "delivery_kpi", answer: "" },
    { question: "Headcount KPI", value: "headcount_kpi", answer: "" },
  ])
  const { width, breakpoints } = useWidth()
  const handleFileChange = async (e) => {
    e.preventDefault()
    const files = e.target.files
    const filesArray = Array.from(files).map((file) => file)
    await setSelectedFile(filesArray)
  }
  const handleKeyChange = (event) => {
    const key = event.target.value
    setSelectedKey(key)
    setSelectedValues("")
  }
  useEffect(() => {
    if (selectedFile.length > 0) {
      handleSubmit()
    }
  }, [selectedFile])
  const handleSubmit = async (e) => {
    const formData = new FormData()

    formData.append("file", selectedFile[0])

    let req = {
      authorization: `Bearer ${isAuth.auth}`,

      token: token,
    }

    if (selectedFile) {
      const progressToastId = toast.info("File upload in progress...", {
        theme: "colored",

        autoClose: false, // Prevent auto-closing the toast
      })
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/trend_analysis`,
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
  const postReqData = async () => {
    try {
      let header = {
        authorization: `Bearer ${isAuth.auth}`,

        token: token,
      }
      let body = {
        sheet_name: selectedKey,
        table_id: selectedValues,
        file_id: currentFile,
      }

      const { isSuccess, data } = await apiCall(
        `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/trend_analysis_data`,
        header,
        body,
        "POST"
      )
      if (isSuccess) {
        setGraphData(data.plot_data)
        const columnNames = Object.keys(data?.plot_data?.y_axis_data || {})
        setColumn(columnNames)
      } else {
      }
    } catch (error) {
      setLoading(false)

      console.error(error)
    }
  }
  const getCommentary = async () => {
    try {
      let header = {
        authorization: `Bearer ${isAuth.auth}`,

        token: token,
      }
      let body = {
        sheet_name: selectedKey,
        table_id: selectedValues,
      }

      const { isSuccess, data } = await apiCall(
        `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/trend_analysis_commentary`,
        header,
        body,
        "GET"
      )
      if (isSuccess) {
        const file_list = data?.map((value) => {
          return {
            label: value.name,
            value: value.id,
          }
        })
        setfilesData(file_list)
      }
    } catch (error) {
      setLoading(false)

      console.error(error)
    }
  }

  const getData = async (id) => {
    setSelectedKey("")
    setData()
    setGraphData()
    setColumn()
    setM()

    try {
      let header = {
        authorization: `Bearer ${isAuth.auth}`,

        token: token,
      }
      let body = {
        file_id: currentFile,
      }
      const { isSuccess, data } = await apiCall(
        `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/trend_analysis_data`,
        header,
        body
      )
      if (isSuccess) {
        setData(data)
      } else {
      }
    } catch (error) {
      setLoading(false)

      console.error(error)
    }
  }
  const getFiles = async (id) => {
    setSelectedKey("")
    setData()
    setGraphData()
    setColumn()
    setM()

    try {
      let header = {
        authorization: `Bearer ${isAuth.auth}`,

        token: token,
      }

      const { isSuccess, data } = await apiCall(
        `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/trend_analysis`,
        header
      )
      if (isSuccess) {
        setFileData(data)
      }
    } catch (error) {
      setLoading(false)

      console.error(error)
    }
  }
  const deleteFiles = async (id) => {
    setSelectedKey("")
    setData()
    setGraphData()
    setColumn()
    setM()

    try {
      let header = {
        authorization: `Bearer ${isAuth.auth}`,

        token: token,
      }
      let body = { file_id: currentFile }

      const { isSuccess, data } = await apiCall(
        `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/trend_analysis_files`,
        header,
        body,
        "DELETE"
      )
      if (isSuccess) {
        getFiles()
      }
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    if (selectedValues) {
      postReqData()
    }
  }, [selectedValues])
  useEffect(() => {
    let element = document.getElementById("chat-box")
    if (!element) return

    element.scrollIntoView({
      block: "start",
      inline: "nearest",
    })
  }, [m, commentary])
  useEffect(() => {
    let element = document.getElementById("generate-commentary")
    if (!element) return

    element.scrollIntoView({
      block: "start",
      inline: "nearest",
    })
  }, [filesData])
  useEffect(() => {
    getFiles()
  }, [])
  useEffect(() => {
    if (currentFile != "") {
      getData()
    }
  }, [currentFile])
  return (
    <>
      <ToastContainer />

      <div className="flex md:space-x-5 app_height overflow-hidden relative rtl:space-x-reverse">
        <div
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
            bodyClass=" py-3 h-full flex flex-col"
            className="h-full bg-white"
          >
            <div className="flex-1 h-full px-6">
              <Button
                icon="material-symbols:upload"
                text="Upload New File"
                className="btn bg-black-500 text-white flex-grow  w-full block mt-4  "
                iconClass=" text-lg"
                onClick={() =>
                  document.querySelector('input[type="file"]').click()
                }
              />
              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <SimpleBar className="h-full px-6  all-todos overflow-x-hidden ">
              <ul className="list mt-6"></ul>
              {fileData && (
                <div className="block pb-4 text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                  File
                  <div className="card flex justify-content-center">
                    <Dropdown
                      style={{ fontSize: "10px" }}
                      value={currentFile}
                      onChange={(e) => setCurrentFile(e.target.value)}
                      options={fileData}
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select File"
                      className="w-full md:w-14rem"
                    />
                    {currentFile && (
                      <span
                        className="ml-1 flex justify-content-center items-center cursor-pointer hover:text-red-500"
                        onClick={() => deleteFiles()}
                      >
                        {" "}
                        <Icon icon="heroicons-outline:trash" />
                      </span>
                    )}
                  </div>
                </div>
              )}
              {data && (
                <div className="block pb-4 text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  lead uppercase">
                  Sheet
                  <div className="card flex justify-content-center">
                    <Dropdown
                      style={{ fontSize: "10px" }}
                      value={selectedKey}
                      onChange={handleKeyChange}
                      options={Object.keys(data).map((key) => ({
                        label: key,
                        value: key,
                      }))}
                      optionLabel="label"
                      placeholder="Select Sheet"
                      className="w-full md:w-14rem"
                    />
                  </div>
                </div>
              )}
              {selectedKey && (
                <div className="block pb-4 text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  uppercase">
                  Table
                  <div className="card flex justify-content-center">
                    <Dropdown
                      style={{ fontSize: "10px" }}
                      value={selectedValues}
                      onChange={(e) => setSelectedValues(e.target.value)}
                      options={data[selectedKey].map((key) => ({
                        label: key,
                        value: key,
                      }))}
                      optionLabel="label"
                      placeholder="Select Table"
                      className="w-full md:w-14rem"
                    />
                  </div>
                </div>
              )}
              {graphData && (
                <div className="block pb-4 text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  uppercase">
                  Chart Type
                  <div className="card flex justify-content-center">
                    <Dropdown
                      style={{ fontSize: "10px" }}
                      value={selectedChartType}
                      onChange={(e) => setSelectedChartType(e.target.value)}
                      options={chartOptions}
                      optionLabel="label"
                      placeholder="Select Chart Type"
                      className="w-full md:w-14rem"
                    />
                  </div>
                </div>
              )}
              {column &&
                selectedChartType != "stacked" &&
                selectedChartType != "pie" && (
                  <div className="block pb-4 text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  uppercase">
                    Column
                    <div className="card flex justify-content-center">
                      <Dropdown
                        style={{ fontSize: "10px" }}
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        options={column.map((key) => ({
                          label: key,
                          value: key,
                        }))}
                        optionLabel="label"
                        placeholder="Select Column"
                        className="w-full md:w-14rem"
                      />
                    </div>
                  </div>
                )}
              {column &&
                selectedChartType != "stacked" &&
                selectedChartType == "pie" && (
                  <div className="block pb-4 text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  uppercase">
                    Column
                    <div className="card flex justify-content-center">
                      <Dropdown
                        style={{ fontSize: "10px" }}
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        options={graphData.x_axis_data.map((key) => ({
                          label: key,
                          value: key,
                        }))}
                        optionLabel="label"
                        placeholder="Select Column"
                        className="w-full md:w-14rem"
                      />
                    </div>
                  </div>
                )}

              {graphData && filesData.length == 0 && (
                <div className="">
                  <Button
                    text="Generate Commentary"
                    className="btn bg-black-500 text-white flex-grow  w-full block mt-4  "
                    iconClass=" text-lg"
                    onClick={getCommentary}
                  />
                </div>
              )}
              {graphData && filesData.length > 0 && (
                <div className="block py-4 text-slate-400 dark:text-slate-400 font-semibold text-[0.65rem]  uppercase">
                  Commentary Files <span className="text-red-500">*</span>
                  <div className="card flex justify-content-center">
                    <MultiSelect
                      value={selectedFiles}
                      onChange={(e) => {
                        setSelectedFiles(e.value)
                      }}
                      options={filesData}
                      optionLabel="label"
                      placeholder="Select Commentary Files"
                      maxSelectedLabels={1}
                      className="w-full md:w-20rem"
                    />
                  </div>
                </div>
              )}
            </SimpleBar>
          </Card>
        </div>
        {/* overlay */}
        {width < breakpoints.lg && (
          <div
            className="overlay bg-slate-900 dark:bg-slate-900 dark:bg-opacity-60 bg-opacity-60 backdrop-filter
         backdrop-blur-sm absolute w-full flex-1 inset-0 z-[99] rounded-md"
          ></div>
        )}
        <div className="flex-1 md:w-[calc(100%-320px)]">
          <div className="h-full bg-white">
            <SimpleBar className="h-full all-todos overflow-x-hidden">
              {graphData ? (
                <div className="2xl:col-span-8 lg:col-span-7 col-span-12">
                  <Card>
                    <div className="legend-ring" id="chart">
                      {selectedChartType != "pie" && (
                        <RevenueBarChart
                          data={graphData}
                          chartType={selectedChartType}
                          column={selectedColumn}
                          height={420}
                        />
                      )}

                      {selectedChartType == "pie" && (
                        <PieChart
                          data={graphData}
                          chartType={selectedChartType}
                          column={selectedColumn}
                          height={420}
                        />
                      )}
                    </div>

                    {filesData.length > 0 && (
                      <>
                        <div>
                          <div id="generate-commentary"></div>

                          <label className="form-label" htmlFor="mul_1">
                            <b> Generate Commentary</b>
                          </label>
                        </div>

                        <Card title="Trends" className="">
                          <TrendQuestions
                            questionData={questionData}
                            setQuestionData={setQuestionData}
                            selectedFiles={selectedFiles}
                            responseId={graphData?.id}
                            selectedKey={selectedKey}
                            selectedValues={selectedValues}
                          />
                        </Card>
                      </>
                    )}
                    <div id="generate-commentary"></div>

                    {m && (
                      <div className="text-contrent p-3 bg-slate-100 dark:bg-slate-600 dark:text-slate-300 text-slate-600 text-sm font-normal mb-1 rounded-md flex-1 whitespace-pre-wrap break-all">
                        <h5>Commentary</h5>

                        <span>
                          <Markdown value={m} />
                        </span>
                      </div>
                    )}
                    {m && !commentary && (
                      <Button
                        text="Generate Trends"
                        className="text-white bg-[#6699cc]  h-min text-sm font-normal"
                        iconClass=" text-lg"
                        onClick={getTrends}
                      />
                    )}
                    {commentary && (
                      <div className="text-contrent p-3 bg-slate-100 dark:bg-slate-600 dark:text-slate-300 text-slate-600 text-sm font-normal mb-1 rounded-md flex-1 whitespace-pre-wrap break-all">
                        <h5>Trends</h5>
                        <span>
                          <Markdown value={commentary} />
                        </span>
                      </div>
                    )}
                    <div id="chat-box"></div>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center mt-20">
                  Please Select or Upload a File to Get Started
                </div>
              )}
            </SimpleBar>
          </div>
        </div>
      </div>
    </>
  )
}

export default Test

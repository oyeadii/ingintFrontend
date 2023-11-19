"use client"
import { useState, useRef, useEffect } from "react"
import {
  SpreadsheetComponent,
  getCellAddress,
} from "@syncfusion/ej2-react-spreadsheet"
import { registerLicense } from "@syncfusion/ej2-base"
import { Dialog } from "@syncfusion/ej2-popups"

import { apiCall } from "@/helper/api_call"
import { useSelector } from "react-redux"
import useToken from "@/hooks/useToken"
import { ToastContainer, toast } from "react-toastify"
import Card from "@/components/ui/Card"

const Anomaly = () => {
  registerLicense(
    "Ngo9BigBOggjHTQxAR8/V1NHaF5cXmVCf1JpRGNGfV5yd0VAalhSTnJcUiweQnxTdEZiWX5fcHJRRWVaVUF3Ww=="
  )

  const { isAuth } = useSelector((state) => state.auth)

  const [workbook, setWorkbook] = useState([])
  const [a, setA] = useState()
  const spreadsheetRef = useRef(null)
  const workbookRef = useRef()
  const previousFormattedCellsRef = useRef([])
  const dialogRef = useRef() // To store the dialog instance
  const [anomList, setAnomList] = useState()
  const get_anomaly = async (abs, per) => {
    let spreadsheet = spreadsheetRef.current
    spreadsheetRef.current.showSpinner()
    let currentWorkbook = workbookRef.current
    if (previousFormattedCellsRef.current.length > 0) {
      previousFormattedCellsRef.current.forEach((cell) => {
        spreadsheet.clear({ type: "Clear Formats", range: cell }) // Clear the content, formats and hyperlinks applied in the provided range.
      })
    }
    let body = {
      workbook: currentWorkbook,
      abs_threshold: [parseInt(abs)],
      pct_threshold: [parseInt(per)],
      sheet_num: [spreadsheet.activeSheetIndex],
    }
    let header = {
      authorization: `Bearer ${isAuth.auth}`,
    }
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/get_anomaly`,
      header,
      body,
      "POST"
    )
    if (isSuccess) {
      setAnomList(data?.commentary_list)
      const cellsBeingFormatted = data?.anomaly_list?.map((item) => item.cell)
      previousFormattedCellsRef.current = cellsBeingFormatted

      for (const item of data?.anomaly_list) {
        spreadsheet.cellFormat(item.style, item.cell)
      }
    }
    spreadsheetRef.current.hideSpinner()
  }

  useEffect(() => {
    let spreadsheet = spreadsheetRef.current
    if (spreadsheet) {
      spreadsheet.addRibbonTabs(
        [
          {
            header: { text: "Financial Insights" },
            content: [
              {
                text: "Anomaly Detection",
                tooltipText: "Anomaly Detection",

                click: () => {
                  if (!dialogRef.current) {
                    dialogRef.current = new Dialog({
                      header: "Anomaly Detection",
                      content:
                        '<div class="e-values ">\
                      <div class="e-minimum">\
                        <span class="e-header">Absolute Threshold</span>\
                        <input class="e-input" id="minvalue" value="0" aria-label="Minimum">\
                        <span id="absError" class="error-message text-xs text-red-500"></span>\
                      </div>\
                      <div class="e-maximum">\
                        <span class="e-header">Percentage Threshold</span>\
                        <input class="e-input" id="maxvalue" value="0" aria-label="Maximum">\
                        <span id="perError" class="error-message text-xs text-red-500"></span>\
                      </div>\
                  </div>',
                      buttons: [
                        {
                          click: () => {
                            let abs = document.getElementById("minvalue").value
                            let per = document.getElementById("maxvalue").value

                            let absErrorElem =
                              document.getElementById("absError")
                            let perErrorElem =
                              document.getElementById("perError")

                            // Clear previous errors
                            absErrorElem.textContent = ""
                            perErrorElem.textContent = ""

                            // Validate absolute threshold (should be an integer and >= 0)
                            if (
                              !Number.isInteger(parseFloat(abs)) ||
                              parseFloat(abs) < 0
                            ) {
                              absErrorElem.textContent =
                                "Absolute threshold should be an integer and cannot be less than zero."
                              return
                            }

                            // Validate percentage threshold (should be between 0 and 100)
                            if (
                              isNaN(per) ||
                              parseFloat(per) < 0 ||
                              parseFloat(per) > 100
                            ) {
                              perErrorElem.textContent =
                                "Percentage threshold should be a number between 0 and 100."
                              return
                            }

                            get_anomaly(abs, per)
                            dialogRef.current.hide()
                            dialogRef.current.destroy()
                            dialogRef.current = null
                          },

                          buttonModel: { content: "Submit", isPrimary: true },
                        },
                        {
                          click: () => {
                            // Handle the input value here
                            dialogRef.current.hide()
                            dialogRef.current.destroy()
                            dialogRef.current = null
                          },
                          buttonModel: { content: "Cancel", isPrimary: false },
                        },
                      ],
                      target: document.body,
                      width: "300px",
                    })
                    dialogRef.current.appendTo("#dialogContainer")
                  } else {
                    dialogRef.current.show()
                  }
                },
              },
            ],
          },
        ],
        "Open"
      )
    }
  }, [])
  useEffect(() => {
    // Target the div by its text content, style, or some other attribute
    const divs = document.querySelectorAll("div")
    divs.forEach((div) => {
      if (
        div.textContent.includes(
          "This application was built using a trial version of Syncfusion Essential Studio. To remove the license validation message permanently, a valid license key must be included."
        )
      ) {
        div.style.display = "none"
      }
    })
  }, [])
  const beforeOpen = (args) => {
    let header = {
      authorization: `Bearer ${isAuth.auth}`,
    }
    args.requestData["headers"] = header
  }

  const beforeSave = (args) => {
    let header = {
      authorization: `Bearer ${isAuth.auth}`,
    }
  }

  const openComplete = async (args) => {
    console.log(args)
    workbookRef.current = args.response.data

    setWorkbook(args.response.data)
    await setA(args.response.data)
    // get_anomaly(args.response.data)
  }

  const saveComplete = async (args) => {
    // const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'example.xlsx';
    //     // Trigger a click event on the download link to initiate the download
    //     a.click();
    //     // Clean up
    //     window.URL.revokeObjectURL(url);
  }

  const select = (args) => {}
  const dataBound = (args) => {}
  const open = () => {}

  return (
    <>
      <div id="dialogContainer"></div>

      <div className="control-pane mb-10">
        <ToastContainer />

        <div className="control-section spreadsheet-control">
          <SpreadsheetComponent
            ref={spreadsheetRef}
            select={select}
            height={"90vh"}
            beforeOpen={beforeOpen}
            //openUrl="https://services.syncfusion.com/react/production/api/spreadsheet/open"
            openUrl={`${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/file_view`}
            openComplete={openComplete}
            beforeSave={beforeSave}
            dataBound={dataBound}
            saveUrl="https://services.syncfusion.com/react/production/api/spreadsheet/save"
            // saveUrl={`${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/download_xlsx`}
            saveComplete={saveComplete}
          ></SpreadsheetComponent>
        </div>
      </div>
      {anomList && (
        <Card bodyClass="p-6 ">
          <h6>The following is the list of Anomalies:</h6>

          <ol className="space-y-3 p-6 rounded-md  lits-by-numbaring custom-list">
            {anomList &&
              anomList.map((value) => (
                <li className="text-sm text-slate-900 dark:text-slate-300 mr-2">
                  <div className="ml-3"> {value}</div>
                </li>
              ))}
          </ol>
        </Card>
      )}
    </>
  )
}
export default Anomaly

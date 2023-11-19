import React, { useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { classNames } from "primereact/utils"
import { InputText } from "primereact/inputtext"
import { Checkbox } from "primereact/checkbox"
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup"

import { Icon } from "@iconify/react"
import "./UsersTable.scss"
import BasicDemo from "./CustomPickList"
import Tooltip from "@/components/ui/Tooltip"
import { useSelector } from "react-redux"
import { apiCall } from "@/helper/api_call"
const UsersTable = ({
  editingRowId,
  setEditingRowId,
  data,
  setUpdatedValues,
  updatedValues,
  handleUpdate,
  handleDelete,
  setSortOrder,
  sortOrder,
  getUsers,
  setCurrentOrderIcon,
  currentOrderIcon,
  loading,
}) => {
  const { isAdmin } = useSelector((state) => state.auth)
  const handleInputChange = (event, field) => {
    const { value } = event.target

    // Store the updated value in the state
    setUpdatedValues((prevState) => ({
      ...prevState,
      [field]: value,
    }))
  }
  const textEditor = (options, field) => {
    if (editingRowId === options.id) {
      return (
        <InputText
          type="text"
          defaultValue={options[field]}
          pt={{
            root: { className: " !w-fit" },
          }}
          onChange={(e) => handleInputChange(e, field)}
        />
      )
    }
    return options[field]
  }
  const nameEditor = (options, field1, field2) => {
    if (editingRowId === options.id) {
      return (
        <div className="flex flex-col gap-2">
          <InputText
            type="text"
            defaultValue={options[field1]}
            pt={{
              root: { className: " !w-fit" },
            }}
            onChange={(e) => handleInputChange(e, field1)}
          />
          <InputText
            type="text"
            defaultValue={options[field2]}
            pt={{
              root: { className: " !w-fit" },
            }}
            onChange={(e) => handleInputChange(e, field2)}
          />
        </div>
      )
    }
    return `${options[field1]} ${options[field2]}`
  }

  const accept = (e) => {
    handleDelete(e.id)
  }
  const reject = () => {}
  const confirm2 = (event, data) => {
    const acceptWithUserData = () => {
      accept(data)
    }
    confirmPopup({
      target: event.currentTarget,
      message: (
        <div>
          Do you want to delete{" "}
          <span className="font-bold">
            {data?.first_name} {data?.last_name}{" "}
          </span>{" "}
          and{" "}
          <span className="font-bold">
            {data?.num_projects} Project Assignments
          </span>
          ?
        </div>
      ),
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: acceptWithUserData, // Pass the wrapped function
      reject,
    })
  }
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-4">
        {" "}
        {editingRowId === rowData.id ? (
          <>
            <Tooltip placement="top" arrow content="Save User Details">
              <div
                onClick={() => {
                  const hasChanges = Object.keys(updatedValues).length > 0

                  if (hasChanges) {
                    // Only call handleUpdate if there are changes
                    handleUpdate(rowData.id)
                  } else {
                    // If no changes, you can handle it differently or show a message
                    setEditingRowId(-1)
                  }
                }}
                className="text-success-500 dark:text-white text-sm   cursor-pointer flex   items-center  "
              >
                <span className="text-base">
                  <Icon icon="basil:save-outline" />
                </span>
              </div>
            </Tooltip>
            <Tooltip placement="top" arrow content="Cancel Editing">
              <div
                onClick={() => {
                  setEditingRowId(-1)
                  setUpdatedValues({})
                }}
                className="  text-danger-500  dark:text-white   text-sm  cursor-pointer flex   items-center  "
              >
                <span className="text-base">
                  <Icon icon="material-symbols:cancel-outline" />
                </span>
              </div>
            </Tooltip>
          </>
        ) : (
          <Tooltip placement="top" arrow content="Edit User Details">
            <div
              onClick={() => {
                setUpdatedValues({})
                setEditingRowId(rowData.id)
              }}
              className="text-success-500 dark:text-white text-sm   cursor-pointer flex   items-center  "
            >
              <span className="text-base">
                <Icon icon="tabler:edit" />
              </span>
            </div>
          </Tooltip>
        )}
        <Tooltip placement="top" arrow content="Delete User">
          <div
            onClick={(e) => confirm2(e, rowData)}
            className="  text-danger-500  dark:text-white   text-sm  cursor-pointer flex   items-center  "
          >
            <span className="text-base">
              <Icon icon="heroicons-outline:trash" />
            </span>
          </div>
        </Tooltip>
      </div>
    )
  }
  const adminTemplate = (rowData) => {
    return (
      <Checkbox
        onChange={(e) => {
          handleAdminCheckboxChange(e, rowData)
        }}
        checked={rowData?.is_sa === 1}
      ></Checkbox>
    )
  }
  const handleAdminCheckboxChange = async (e, rowData) => {
    let myHeaders = {
      authorization: `Bearer ${isAdmin.auth}`,
    }
    let body = {
      id: rowData?.id,
    }
    let updateData = { is_sa: rowData?.is_sa == 1 ? 0 : 1 }
    body["to_update"] = updateData
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/user/details`,
      myHeaders,
      body,
      "PUT"
    )
    if (isSuccess) {
      getUsers()
    }
  }
  const ProjectTemplate = (rowData) => {
    return (
      <BasicDemo
        num_projects={rowData.num_projects}
        userId={rowData.id}
        full_name={`${rowData?.first_name} ${rowData?.last_name}`}
        getUsers={getUsers}
      />
    )
  }

  const handleSortButtonClick = () => {
    if (sortOrder === "asc") {
      setSortOrder("desc")
      setCurrentOrderIcon("octicon:sort-desc-16")
    } else if (sortOrder === "desc") {
      setCurrentOrderIcon("basil:sort-outline")
      setSortOrder("")
    } else {
      setSortOrder("asc")
      setCurrentOrderIcon("octicon:sort-asc-16")
    }
  }
  return (
    <div className="px-4">
      <ConfirmPopup />

      <DataTable
        editMode="row"
        value={data}
        loading={loading}
        dataKey="id"
        pt={{
          datatable: {
            root: ({ props }) => ({
              className: "!flex flex-col h-full !bg-slate-700",
            }),
          },
          thead: {
            root: {
              className: "!bg-teal-400 !border-teal-400 ",
            },
            th: {
              className: "!bg-teal-400",
            },
          },
          headerRow: {
            className: "dark:!bg-slate-700",
          },
        }}
      >
        {/* <Column body={indexTemplate} header="#" style={{ width: "50px" }} /> */}

        <Column
          field="email"
          header={
            <button
              onClick={() => {
                handleSortButtonClick()
              }}
              className="flex gap-2"
            >
              <div>Email</div>
              <div>
                <Icon width={20} icon={currentOrderIcon} />
              </div>
            </button>
          }
          style={{ width: "30%" }}
          body={(options) => textEditor(options, "email")}
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
              className: "!text-[#002b49] dark:!text-white  !text-sm",
            },
            sortIcon: {
              className: "!text-[#002b49] dark:!text-white !text-sm !w-3 ",
            },
          }}
        ></Column>
        <Column
          header="Projects"
          body={ProjectTemplate}
          style={{ width: "10%" }}
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
              className: "!text-[#002b49] dark:!text-white !text-sm ",
            },
            sortIcon: {
              className: "!text-[#002b49] dark:!text-white !text-sm !w-3 ",
            },
          }}
        ></Column>
        <Column
          header="Admins"
          field="num_admins"
          // body={AdminsTemplate}
          style={{ width: "10%" }}
          pt={{
            headerCell: {
              className:
                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
            },
            bodyCell: {
              className:
                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
            },
            columnTitle: {
              className: "dark:!bg-slate-700",
            },
            headerContent: {
              className: "!text-[#002b49] dark:!text-white !text-sm ",
            },
            sortIcon: {
              className: "!text-[#002b49] dark:!text-white !text-sm !w-3 ",
            },
          }}
        ></Column>
        {/* <Column
      header="Super Admin"
      body={actionBodyTemplate}
    ></Column> */}
        {/* <Column
          header="Super Admin"
          body={adminTemplate}
          style={{ width: "10%" }}
          pt={{
            bodyCell: {
              className:
                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
            },
            columnTitle: {
              className: "dark:!bg-slate-700",
            },
            headerContent: {
              className: "!text-[#002b49] dark:!text-white  !text-sm",
            },
            sortIcon: {
              className: "!text-[#002b49] dark:!text-white !text-sm !w-3 ",
            },
            headerCell: ({ context }) => {
              console.log(context) // Log the value of context to the console
              return {
                className: classNames(
                  "dark:!bg-slate-700 dark:after:!bg-white dark:!text-white dark:!border-slate-300",
                  context?.highlighted
                    ? "text-blue-700 bg-blue-100 dark:text-white/80 dark:bg-blue-300"
                    : "text-gray-600 bg-transparent dark:text-white/80 dark:bg-transparent"
                ),
              }
            },
          }}
        ></Column> */}
        <Column
          rowEditor
          header="Actions"
          body={actionBodyTemplate}
          style={{ width: "10%" }}
          pt={{
            headerCell: {
              className:
                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
            },
            bodyCell: {
              className:
                "dark:!bg-slate-700 dark:!text-white dark:!border-slate-300",
            },
            columnTitle: {
              className: "dark:!bg-slate-700",
            },
            headerContent: {
              className: "!text-[#002b49] dark:!text-white !text-sm ",
            },
            sortIcon: {
              className: "!text-[#002b49] dark:!text-white ",
            },
          }}
        ></Column>
      </DataTable>
    </div>
  )
}

export default UsersTable

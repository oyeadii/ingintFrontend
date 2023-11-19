import React from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { InputText } from "primereact/inputtext"
import { Icon } from "@iconify/react"
import "./UsersTable.scss"
import CustomPickList from "./CustomPickList"
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup"
import Tooltip from "@/components/ui/Tooltip"
import moment from "moment"

const UsersTable = ({
  editingRowId,
  setEditingRowId,
  data,
  setUpdatedValues,
  updatedValues,
  handleUpdate,
  handleDelete,
  getUsers,
}) => {
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
  const formattedData = (options, field) => {
    return moment(options[field]).format("LLL")
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
          <span className="font-bold">{data?.project_name}</span> and{" "}
          <span className="font-bold">
            {data?.assignments} User Assignments
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
            <Tooltip placement="top" arrow content="Save Project Details">
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
          <Tooltip placement="top" arrow content="Edit Project Details">
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
        <Tooltip placement="top" arrow content="Delete Project">
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

  const ProjectTemplate = (rowData) => {
    return (
      <CustomPickList
        userId={rowData.id}
        num_assignments={rowData?.assignments}
        getUsers={getUsers}
        projectName={rowData?.project_name}
      />
    )
  }

  return (
    <div className="px-4">
      <ConfirmPopup />

      <DataTable
        editMode="row"
        value={data}
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
          field="project_name"
          header="Project Name"
          sortable
          style={{ width: "30%" }}
          body={(options) => textEditor(options, "project_name")}
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
          field="created_at"
          header="Created At"
          sortable
          style={{ width: "30%" }}
          body={(options) => formattedData(options, "created_at")}
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
          header="Assignments"
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

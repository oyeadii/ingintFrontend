import React from "react"
import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import useDarkMode from "@/hooks/useDarkMode"
import useRtl from "@/hooks/useRtl"

const PieChart = ({ height = 400, data, chartType = "stacked", column }) => {
  const [isDark] = useDarkMode()
  const [isRtl] = useRtl()

  const processData = (data) => {
    const { x_axis_data, y_axis_data } = data

    // Extract the labels and values from the data
    const labels = Object.keys(y_axis_data)
    const index = x_axis_data?.findIndex((value) => {
      return value == column
    })
    const values = Object.values(y_axis_data).map(
      (valuesArr) => valuesArr[index == -1 ? 0 : index]
    )
    // Create the series data array in the required format for the pie chart
    const seriesData = values

    return { labels, seriesData }
  }
  const processedData = processData(data)
  const pieOptions = {
    labels: processedData.labels,
    dataLabels: {
      enabled: true,
    },

    colors: ["#4669FA", "#F1595C", "#50C793", "#0CE7FA", "#FA916B"],
    legend: {
      position: "bottom",
      fontSize: "16px",
      fontFamily: "Inter",
      fontWeight: 400,
      labels: {
        colors: isDark ? "#CBD5E1" : "#475569",
      },
      markers: {
        width: 6,
        height: 6,
        offsetY: -1,
        offsetX: -5,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },

    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  }

  const renderPieChart = () => {
    return (
      <Chart
        options={pieOptions}
        series={processedData.seriesData}
        type="pie"
        height={height}
        width="100%"
      />
    )
  }

  return <div>{renderPieChart()}</div>
}

export default PieChart

import React from "react"
import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const LineChart = ({ series }) => {
  const options = {
    chart: {
      id: "line-chart",
    },
    yaxis: {
      labels: {
        style: {
          colors: "#475569",
          fontFamily: "Inter",
        },
      },
    },

    xaxis: {
      categories: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ],
    },
  }

  return (
    <div>
      <Chart options={options} series={series} type="line" height={400} />
    </div>
  )
}

export default LineChart

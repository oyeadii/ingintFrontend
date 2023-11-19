import React from "react"
import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import useDarkMode from "@/hooks/useDarkMode"
import useWidth from "@/hooks/useWidth"

const RadialsChart = ({ data }) => {
  const [isDark] = useDarkMode()
  const { width, breakpoints } = useWidth()
  const series = data?.map((item) => item.value)

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: "22px",
            color: isDark ? "#CBD5E1" : "#475569",
          },
          value: {
            fontSize: "16px",
            color: isDark ? "#CBD5E1" : "#475569",
          },
          total: {
            show: true,
            label: "Total",
            color: isDark ? "#CBD5E1" : "#475569",
            formatter: function (w) {
              return w.globals.seriesTotals[0].toFixed(2)
            },
          },
        },
        track: {
          background: "#E2E8F0",
          strokeWidth: "97%",
        },
      },
    },
    labels: [],
    colors: ["#4669FA", "#FA916B", "#50C793", "#0CE7FA"],
  }
  const labels = data?.map((item) => item.name)

  // Update the options object with the labels
  options.labels = labels

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="radialBar"
        height={width > breakpoints.md ? 360 : 250}
      />
    </div>
  )
}

export default RadialsChart

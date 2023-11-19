import React, { forwardRef, useRef } from "react"
import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import useDarkMode from "@/hooks/useDarkMode"
import useRtl from "@/hooks/useRtl"

const RevenueBarChart = ({
  height = 400,
  data,
  chartType = "stacked",
  column,
}) => {
  const [isDark] = useDarkMode()
  const [isRtl] = useRtl()
  const chartRef = useRef(null)
  const handleCaptureChartImage = () => {
    if (chartRef.current) {
      const chart = chartRef.current.chart

      // Capture the chart image
      chart.dataURI().then((dataURI) => {
        // Send the image dataURI in an API request
        // sendImageToAPI(dataURI);
      })
    }
  }
  const transformData = (data) => {
    const { x_axis_data, y_axis_data } = data
    const series = []

    // Iterate over the keys in y_axis_data
    for (const key in y_axis_data) {
      series.push({
        name: key,
        data: y_axis_data[key],
      })
    }

    return series
  }
  const transformedData = transformData(data)
  const series = [
    {
      name: column,
      data: data?.y_axis_data[column],
    },
  ]
  const pieSeries = data?.y_axis_data[column]
  const processData = (data) => {
    const { x_axis_data, y_axis_data } = data

    // Extract the labels and values from the data
    const labels = Object.keys(y_axis_data)
    const values = Object.values(y_axis_data).map(
      (valuesArr) => valuesArr[valuesArr.length - 1]
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
  const stackOptions = {
    // Common options for all chart types
    chart: {
      stacked: true,
      stackType: "100%",

      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true | '<img src="/static/icons/reset.png" width="20">',
          customIcons: [],
        },
      },
    },

    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontFamily: "Inter",
      offsetY: -30,
      markers: {
        width: 8,
        height: 8,
        offsetY: -1,
        offsetX: -5,
        radius: 12,
      },
      labels: {
        colors: isDark ? "#CBD5E1" : "#475569",
      },
      itemMargin: {
        horizontal: 18,
        vertical: 0,
      },
    },
    title: {
      text: "Trend Analysis",
      align: "left",
      offsetX: isRtl ? "0%" : 0,
      offsetY: 13,
      floating: false,
      style: {
        fontSize: "20px",
        fontWeight: "500",
        fontFamily: "Inter",
        color: isDark ? "#fff" : "#0f172a",
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    yaxis: {
      title: {
        text: data?.y_axis,
        style: {
          color: isDark ? "#FFF" : "#0f172a",
        },
      },
      opposite: isRtl ? true : false,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },
    xaxis: {
      categories: data?.x_axis_data,
      title: {
        text: data?.x_axis,
      },
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
          fontWeight: "bold",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val.toLocaleString()
        },
      },
    },
    colors: [
      "#4669FA",
      "#0CE7FA",
      "#FA916B",
      "#FF00FF",
      "#00FFFF",
      "#FFA500",
      "#800080",
      "#008000",
      "#FF0000",
      "#0000FF",
    ],
    grid: {
      show: true,
      borderColor: isDark ? "#334155" : "#E2E8F0",
      strokeDashArray: 10,
      position: "back",
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            position: "bottom",
            offsetY: 8,
            horizontalAlign: "center",
          },
        },
      },
    ],
  }
  const options = {
    // Common options for all chart types
    dataLabels: {
      enabled: true,

      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    chart: {
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true | '<img src="/static/icons/reset.png" width="20">',
          customIcons: [],
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: "top",

          // top, center, bottom
        },
      },
    },
    fill: {
      colors: ["#F44336", "#E91E63", "#9C27B0"],
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontFamily: "Inter",
      offsetY: -30,
      markers: {
        width: 8,
        height: 8,
        offsetY: -1,
        offsetX: -5,
        radius: 12,
      },
      labels: {
        colors: isDark ? "#CBD5E1" : "#475569",
      },
      itemMargin: {
        horizontal: 18,
        vertical: 0,
      },
    },
    title: {
      text: "Trend Analysis",
      align: "left",
      offsetX: isRtl ? "0%" : 0,
      offsetY: 13,
      floating: false,
      style: {
        fontSize: "20px",
        fontWeight: "500",
        fontFamily: "Inter",
        color: isDark ? "#fff" : "#0f172a",
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    yaxis: {
      title: {
        text: data?.y_axis,
        style: {
          color: isDark ? "#FFF" : "#0f172a",
        },
      },
      opposite: isRtl ? true : false,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
    },
    xaxis: {
      categories: data?.x_axis_data,
      title: {
        text: data?.x_axis,
      },
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
          fontWeight: "bold",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val.toLocaleString()
        },
      },
    },
    colors: "#6699cc",
    grid: {
      show: true,
      borderColor: isDark ? "#334155" : "#E2E8F0",
      strokeDashArray: 10,
      position: "back",
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            position: "bottom",
            offsetY: 8,
            horizontalAlign: "center",
          },
        },
      },
    ],
  }
  const lineOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    markers: {
      size: 6,
      colors: ["#FF5722"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    grid: {
      borderColor: isDark ? "#334155" : "#E2E8F0",
      strokeDashArray: 10,
      position: "back",
    },
    yaxis: {
      opposite: isRtl ? true : false,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
        },
      },
      title: {
        text: data?.y_axis,
        style: {
          color: isDark ? "#FFF" : "#0f172a",
        },
      },
    },
    xaxis: {
      categories: data?.x_axis_data,
      title: {
        text: data?.x_axis,
        style: {
          color: isDark ? "#FFF" : "#0f172a",
        },
      },
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontFamily: "Inter",
          fontWeight: "bold",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val.toLocaleString()
        },
      },
    },
  }
  const renderBarChart = () => {
    return (
      <Chart
        options={options}
        series={series}
        type="bar"
        height={height}
        width="100%"
      />
    )
  }

  const renderStackedChart = () => {
    return (
      <Chart
        options={stackOptions}
        series={transformedData}
        type="bar"
        stacked="true"
        height={height}
        width="100%"
      />
    )
  }

  const renderLineChart = () => {
    return (
      <Chart
        options={lineOptions}
        series={series}
        type="line"
        height={height}
        width="100%"
      />
    )
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

  return (
    <div>
      {chartType === "stacked" && renderStackedChart()}
      {chartType === "bar" && renderBarChart()}
      {chartType === "line" && renderLineChart()}
      {chartType === "pie" && renderPieChart()}
    </div>
  )
}

export default RevenueBarChart

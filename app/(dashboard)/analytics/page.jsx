"use client"
import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import Card from "@/components/ui/Card"
import ImageBlock1 from "@/components/partials/widget/block/image-block-1"
import GroupChart1 from "@/components/partials/widget/chart/group-chart-1"
import RevenueBarChart from "@/components/partials/widget/chart/revenue-bar-chart"
import RadialsChart from "@/components/partials/widget/chart/radials"
import HomeBredCurbs from "@/components/partials/HomeBredCurbs"
import { apiCall } from "@/helper/api_call"
import { useSelector } from "react-redux"
import ListLoading from "@/components/skeleton/ListLoading"
import Trend from "@/components/Trend/Trend"

const Dashboard = () => {
  const { isAuth } = useSelector((state) => state.auth)

  const [graphSeries, setGraphSeries] = useState()
  const [pieSeries, setPieSeries] = useState()
  const [filterMap, setFilterMap] = useState("usa")
  const graphData = async () => {
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/graph`,
      { authorization: `Bearer ${isAuth.auth}` }
    )
    if (isSuccess) {
      setGraphSeries(data)
    }
  }
  const pieData = async () => {
    const { isSuccess, data } = await apiCall(
      `${process.env.NEXT_PUBLIC_NLP_API_URL}/analytics/pie`,
      { authorization: `Bearer ${isAuth.auth}` }
    )
    if (isSuccess) {
      setPieSeries(data)
    }
  }
  useEffect(() => {
    graphData()
    pieData()
  }, [])
  return (
    <div id="overview">
      <HomeBredCurbs title="Dashboard" />
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
          <ImageBlock1 />
        </div>
        <div className="2xl:col-span-9 lg:col-span-8 col-span-12">
          <Card bodyClass="p-4">
            <div className="grid md:grid-cols-3 col-span-1 gap-4">
              <GroupChart1 />
            </div>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-8 col-span-12">
          <Card title={"KRA's"}>
            <div className="legend-ring">
              {graphSeries ? (
                <RevenueBarChart series={graphSeries} />
              ) : (
                <ListLoading count={3} />
              )}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-12">
          <Card title="% KRA's Achieved" bodyClass="">
            {pieSeries ? (
              <RadialsChart data={pieSeries} />
            ) : (
              <ListLoading count={3} />
            )}
          </Card>
        </div>
        <div className="lg:col-span-12 col-span-12">
          <Card title="Trends" noborder>
            <Trend />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

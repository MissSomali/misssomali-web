"use client";

import { useEffect, useRef } from "react";
import type { ApexOptions } from "apexcharts";

interface ApexChartWrapperProps {
  options: ApexOptions;
  series: any[];
  type: "line" | "area" | "bar" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick" | "radar" | "polarArea";
  height?: number | string;
  width?: number | string;
}

export default function ApexChartWrapper({
  options,
  series,
  type,
  height = "auto",
  width = "100%",
}: ApexChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let active = true;
    let chartInstance: any = null;

    // Load ApexCharts dynamically on the client
    import("apexcharts").then((ApexChartsModule) => {
      const ApexCharts = ApexChartsModule.default || ApexChartsModule;
      if (!active || !containerRef.current) return;

      // Ensure any old chart instance in this container is cleaned up
      if (chartRef.current) {
        try {
          chartRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying previous chart instance:", e);
        }
        chartRef.current = null;
      }

      const mergedOptions = {
        ...options,
        chart: {
          ...options.chart,
          type,
          height,
          width,
        },
        series,
      };

      chartInstance = new ApexCharts(containerRef.current, mergedOptions);
      chartInstance.render().then(() => {
        if (active) {
          chartRef.current = chartInstance;
        } else {
          // If deactivated during rendering, destroy immediately
          try {
            chartInstance.destroy();
          } catch (e) {
            // ignore
          }
        }
      });
    });

    return () => {
      active = false;
      if (chartInstance) {
        try {
          chartInstance.destroy();
        } catch (e) {
          // ignore
        }
      }
      chartRef.current = null;
    };
  }, [options, series, type, height, width]);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: height }} />;
}

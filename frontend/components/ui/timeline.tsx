"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { BackgroundGradient } from "./background-gradient";

interface TimelineEntry {
  date: string;
  events: Array<EventItem>;
}
interface EventItem {
  time: string;
  title: string;
  description: string;
  organiser: string;
  location: string;
  img: string;
  status: string;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full  bg-neutral-950 font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl   pt-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-4xl mb-4 flex font-sans font-bold   text-[#ffffff90] max-w-4xl">
          Events
        </h2>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-2 w-10 rounded-full  bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full  bg-neutral-800 border  border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold  text-neutral-400 ">
                {item.date}
              </h3>
            </div>

            <div className="relative pl-12 pr-4 md:pl-4 w-full text-neutral-400">
              <h3 className="md:hidden block pl-1  text-2xl mb-4 text-left font-bold  text-neutral-500">
                {item.date}
              </h3>
              <div className="flex gap-3 flex-col">
                {item.events.map((eventItem, index) => (
                  <BackgroundGradient
                    animate={false}
                    className="rounded-[8px]  max-w-sm p-4 sm:p-10  bg-zinc-900"
                  >
                    <div className="flex flex-row">
                      <div className="flex w-2/3 flex-col gap-1 text-start">
                        <p className="text-[14px]     text-[hsla(0,0%,100%,.5)]">
                          Live {eventItem.time}
                        </p>
                        <p className="text-[16px]      text-neutral-200">
                          {eventItem.title}
                        </p>
                        <p className="text-[14px]    text-[hsla(0,0%,100%,.5)]">
                          By {eventItem.organiser}
                        </p>
                        <p className="text-[14px] flex flex-row gap-1 items-center   text-[hsla(0,0%,100%,.5)]">
                          <div className="w-4 h-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                            >
                              <g
                                fill="none"
                                fill-rule="evenodd"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              >
                                <path d="M2 6.854C2 11.02 7.04 15 8 15s6-3.98 6-8.146C14 3.621 11.314 1 8 1S2 3.62 2 6.854"></path>
                                <path d="M9.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path>
                              </g>
                            </svg>
                          </div>{" "}
                          {eventItem.location}
                        </p>
                        <p className="text-[14px] w-fit   text-white bg-[#3cbd2c]  px-[4px] rounded-[4px]">
                          {eventItem.status}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        {" "}
                        <img
                          className={"h-[100px] w-[100px]"}
                          src={eventItem.img}
                        />
                      </div>
                    </div>
                  </BackgroundGradient>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

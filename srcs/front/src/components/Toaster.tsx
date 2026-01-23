"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, CircleX, Loader2Icon } from "lucide-react"

export default function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-left"
      theme="dark"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <CircleX className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "!w-fit !bg-white/10 backdrop-blur-xl !border !border-white/10 !text-white shadow-lg rounded-md py-3 pr-6 pl-5 flex items-center gap-3",
        },
      }}
      {...props}
    />
  )
}
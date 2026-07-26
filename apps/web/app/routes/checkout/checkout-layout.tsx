import { CheckoutHeader } from "@academy/user-ui/components/shared/checkout-header"
import type { ReactNode } from "react"
import { Outlet } from "react-router"

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CheckoutHeader />
      {children}
      <Outlet />
    </>
  )
}

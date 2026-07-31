import { redirect } from "react-router"

/** There is no dashboard yet — courses is the panel's landing screen. */
export function loader() {
  return redirect("/courses")
}

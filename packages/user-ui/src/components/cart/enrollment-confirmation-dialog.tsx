import { CoursesData } from "@academy/courses-api/graphql/queries/courses"
import { CartLine, CartLineItem } from "@academy/user-ui/types/api"
import { CourseGrid } from "../course/course-card"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogProps,
  DialogTitle,
} from "../ui/dialog"
import { CartItemRow, CartItemRowSkeleton } from "./cart-components"
import { Link, useParams } from "react-router"
import { CreateEnrollmentResult } from "@academy/courses-api/graphql/mutations/enrollments"

import type { CartItemRowLabels } from "./item-added-to-cart-dialog"

interface EnrollmentConfirmationDialogProps extends DialogProps {
  enrolledCourse?: CreateEnrollmentResult
  isLoading?: boolean
  labels: {
    title: string
    goToCoursesCta: string
    keepShoppingCta: string
    cartItem: CartItemRowLabels
  }
}

export const EnrollmentConfirmationDialog = ({
  enrolledCourse,
  isLoading,
  labels,
  ...rest
}: EnrollmentConfirmationDialogProps) => {
  const { lang } = useParams()
  const course = enrolledCourse?.createEnrollment.course
  const line: CartLine = {
    item: course as unknown as CartLineItem,
    id: enrolledCourse?.createEnrollment.id ?? "",
    cartId: enrolledCourse?.createEnrollment.id ?? "",
    itemId: enrolledCourse?.createEnrollment.course.id ?? "",
    itemType: "Course",
    inStock: true,
    notes: null,
    quantity: 0,
    unitPrice: 0,
  }
  return (
    <Dialog {...rest}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold">
            {labels.title}
          </DialogTitle>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          {isLoading || !enrolledCourse ? (
            <CartItemRowSkeleton />
          ) : (
            <CartItemRow
              line={line}
              onRemove={() => console.log("removed")}
              labels={labels.cartItem}
              showActions={false}
              showStockMessage={false}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="default"
                render={<Link to={`/${lang}/dashboard/courses`} />}
              >
                {labels.goToCoursesCta}
              </Button>
            }
          />
          <DialogClose
            render={<Button variant="outline">{labels.keepShoppingCta}</Button>}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

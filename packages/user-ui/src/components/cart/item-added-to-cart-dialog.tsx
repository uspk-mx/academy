import { CoursesData } from "@academy/courses-api/graphql/queries/courses"
import { CartLine, CartLineItem } from "@academy/user-ui/types/api"
import { CourseGrid, type CourseCardLabels } from "../course/course-card"
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
import { Skeleton } from "../ui/skeleton"
import { Link, useParams } from "react-router"

export interface CartItemRowLabels {
  itemSaveLabel: string
  itemRemoveLabel: string
  bundleBadge: string
  subscriptionBadge: string
  freeBadge: string
  studentsLabel: string
  outOfStockText: string
}

interface ItemAddedToCartDialog extends DialogProps {
  courses: CoursesData["courses"]["course"]
  addedItem?: CartLine
  isLoading?: boolean
  labels: {
    title: string
    boughtTogetherTitle: string
    goToCartCta: string
    keepShoppingCta: string
    cartItem: CartItemRowLabels
    cardLabels?: CourseCardLabels
  }
}

export const ItemAddedToCartDialog = ({
  addedItem,
  courses,
  isLoading,
  labels,
  ...rest
}: ItemAddedToCartDialog) => {
  const { lang } = useParams()
  return (
    <Dialog {...rest}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold">
            {labels.title}
          </DialogTitle>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto p-4">
          {isLoading || !addedItem ? (
            <CartItemRowSkeleton />
          ) : (
            <CartItemRow
              line={addedItem}
              onRemove={() => console.log("removed")}
              labels={labels.cartItem}
              showActions={false}
              showStockMessage={false}
            />
          )}
          <h3 className="my-4 font-heading text-xl font-bold">
            {labels.boughtTogetherTitle}
          </h3>
          <CourseGrid
            courses={courses}
            variant="commerce"
            columns={2}
            labels={labels.cardLabels}
          />
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="default"
                size="lg"
                render={<Link to={`/${lang}/cart`} />}
              >
                {labels.goToCartCta}
              </Button>
            }
          />
          <DialogClose
            render={
              <Button variant="outline" size="lg">
                {labels.keepShoppingCta}
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

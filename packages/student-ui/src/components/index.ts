export { StudentHeader, type StudentHeaderProps } from "./header"
export { StudentSidebar, type StudentSidebarProps } from "./sidebar"
export { StudentMobileNav, type StudentMobileNavProps } from "./mobile-nav"
export { CommandMenu, useCommandMenu } from "./command-menu"
export {
  StudentCourseCard,
  StudentCourseCardSkeleton,
  type StudentCourseCardProps,
} from "./course-card"
export {
  StudentCoursesPage,
  type StudentCoursesPageProps,
} from "./pages/courses-page"
export {
  StudentProfilePage,
  type StudentProfilePageProps,
} from "./pages/profile-page"
export {
  getStudentNavItems,
  getPrimaryMobileNavItems,
  dashboardBase,
  type StudentNavItem,
} from "../lib/nav-items"
export {
  defaultCoursesPageLabels,
  type CourseFilter,
  type CourseSort,
  type CoursesPageLabels,
  type StudentCourseCardItem,
} from "../types/courses"
export {
  defaultProfilePageLabels,
  type ProfileActionData,
  type ProfilePageLabels,
  type StudentProfile,
} from "../types/profile"
export {
  defaultStudentLayoutLabels,
  type StudentLayoutLabels,
  type StudentNotification,
  type StudentUser,
} from "../types/layout"

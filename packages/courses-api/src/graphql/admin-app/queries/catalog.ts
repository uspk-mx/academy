import { runQuery } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

export const ADMIN_BUNDLES_QUERY = graphql(`
  query AdminBundles(
    $search: String
    $sortBy: String
    $sortOrder: String
    $page: Int
    $limit: Int
  ) {
    instructorBundles(
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
      page: $page
      limit: $limit
    ) {
      totalCount
      pageInfo {
        page
        limit
        offset
        hasNextPage
      }
      bundle {
        id
        title
        description
        featuredImage
        price
        subtotalRegularPrice
        discountType
        discountValue
        createdAt
        updatedAt
        courses {
          id
          title
          featuredImage
        }
      }
    }
  }
`)

export const ADMIN_LEARNING_PATHS_QUERY = graphql(`
  query AdminLearningPaths {
    learningPaths {
      id
      name
      description
      featuredImage
      createdAt
      updatedAt
      courses {
        position
        course {
          id
          title
          featuredImage
        }
      }
    }
  }
`)

export const ADMIN_ENROLLMENTS_QUERY = graphql(`
  query AdminEnrollments {
    getEnrollments {
      id
      status
      enrolledAt
      user {
        id
        fullName
        email
        profilePicture
      }
      course {
        id
        title
        featuredImage
      }
    }
  }
`)

export const ADMIN_PLANS_QUERY = graphql(`
  query AdminSubscriptionPlans {
    subscriptionPlans {
      id
      planName
      planDescription
      price
      duration
      stripePricePlanID
      createdAt
      updatedAt
      category {
        id
        name
      }
    }
  }
`)

export const ADMIN_CERTIFICATE_TEMPLATES_QUERY = graphql(`
  query AdminCertificateTemplates {
    getCertificateTemplates {
      id
      name
      content
      logoUrl
      background
    }
  }
`)

/** Title-only course list for the pickers (bundles, paths, prerequisites). */
export const ADMIN_COURSE_OPTIONS_QUERY = graphql(`
  query AdminCourseOptions($limit: Int) {
    instructorCourses(limit: $limit) {
      course {
        id
        title
        featuredImage
        status
      }
    }
  }
`)

export type AdminBundlesData = ResultOf<typeof ADMIN_BUNDLES_QUERY>
export type AdminBundlesVariables = VariablesOf<typeof ADMIN_BUNDLES_QUERY>
export type AdminBundle = AdminBundlesData["instructorBundles"]["bundle"][number]

export type AdminLearningPathsData = ResultOf<
  typeof ADMIN_LEARNING_PATHS_QUERY
>
export type AdminLearningPath = AdminLearningPathsData["learningPaths"][number]

export type AdminEnrollmentsData = ResultOf<typeof ADMIN_ENROLLMENTS_QUERY>
export type AdminEnrollment = NonNullable<
  AdminEnrollmentsData["getEnrollments"]
>[number]

export type AdminPlansData = ResultOf<typeof ADMIN_PLANS_QUERY>
export type AdminPlan = AdminPlansData["subscriptionPlans"][number]

export type AdminCertificateTemplatesData = ResultOf<
  typeof ADMIN_CERTIFICATE_TEMPLATES_QUERY
>
export type AdminCertificateTemplate = NonNullable<
  AdminCertificateTemplatesData["getCertificateTemplates"]
>[number]

export type AdminCourseOption = ResultOf<
  typeof ADMIN_COURSE_OPTIONS_QUERY
>["instructorCourses"]["course"][number]

export function getAdminBundles(
  request: Request,
  variables: AdminBundlesVariables
) {
  return runQuery(request, ADMIN_BUNDLES_QUERY, variables)
}

export function getAdminLearningPaths(request: Request) {
  return runQuery(request, ADMIN_LEARNING_PATHS_QUERY, {})
}

export function getAdminEnrollments(request: Request) {
  return runQuery(request, ADMIN_ENROLLMENTS_QUERY, {})
}

export function getAdminPlans(request: Request) {
  return runQuery(request, ADMIN_PLANS_QUERY, {})
}

export function getAdminCertificateTemplates(request: Request) {
  return runQuery(request, ADMIN_CERTIFICATE_TEMPLATES_QUERY, {})
}

export function getAdminCourseOptions(request: Request, limit = 200) {
  return runQuery(request, ADMIN_COURSE_OPTIONS_QUERY, { limit })
}

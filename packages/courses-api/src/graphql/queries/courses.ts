import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const COURSES_QUERY = graphql(`
  query Courses(
    $search: String
    $sortBy: String
    $sortOrder: String
    $page: Int
    $limit: Int
    $categoryIds: [ID!]
    $levelIds: [ID!]
    $durations: [String!]
    $maxPrice: Int
  ) {
    courses(
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
      page: $page
      limit: $limit
      categoryIds: $categoryIds
      levelIds: $levelIds
      durations: $durations
      maxPrice: $maxPrice
    ) {
      totalCount
      pageInfo {
        page
        limit
        offset
        hasNextPage
      }
      course {
        id
        featuredImage
        shortDescription
        description
        tags
        slug
        featuredImage
        reviews {
          rating
        }
        price
        discountedPrice
        promotionDuration
        category {
          id
          name
        }
        level {
          id
          name
        }
        duration
        price
        pricingType
        status
        tags
        title
        description
        creatorID
        maxEnrollments
        visibility
        scheduledPublishAt
        publishedAt
        isUnlocked
        createdAt
        updatedAt
        pricingType
        slug
        video {
          id
          type
          tags
          source
          height
          format
          duration
          description
          createdAt
          videoURL
          width
          updatedAt
        }
        extraSettings {
          key
          value
        }
        enrollments {
          id
          status
          enrolledAt
        }
        metadata {
          id
          learnings
          learningsList
          materialsIncluded
          requirements
          targetAudience
          benefits
        }
        instructors {
          id
          fullName
          email
        }
        requirements
        requirementsList
        prerequisites {
          title
          level {
            id
            name
          }
        }
        learningPaths {
          id
          featuredImage
          description
          name
        }
        topics {
          lessons {
            id
            title
          }
          quizzes {
            id
            title
          }
        }
      }
    }
  }
`)

export type CoursesData = ResultOf<typeof COURSES_QUERY>
export type CoursesVariable = VariablesOf<typeof COURSES_QUERY>

export async function getCourses({
  request,
  variables,
}: {
  request: Request
  variables: CoursesVariable
}): Promise<CoursesData> {
  return coursesApiClient(request, COURSES_QUERY, variables)
}

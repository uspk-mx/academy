import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

export const COURSE_BY_SLUG_QUERY = graphql(`
  query CourseBySlug($slug: String!) {
    courseBySlug(slug: $slug) {
      id
      featuredImage
      shortDescription
      description
      tags
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
`)

export type CourseBySlugData = ResultOf<typeof COURSE_BY_SLUG_QUERY>
export type CourseBySlugVariables = VariablesOf<typeof COURSE_BY_SLUG_QUERY>

export async function getCourseBySlug({
  request,
  variables,
}: {
  request: Request
  variables: CourseBySlugVariables
}): Promise<CourseBySlugData> {
  return coursesApiClient(request, COURSE_BY_SLUG_QUERY, variables)
}

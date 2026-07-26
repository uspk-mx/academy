import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

export const ENROLLMENTS = graphql(`
  query GetUserEnrollments {
    getUserEnrollments {
      id
      course {
        id
        title
        description
        shortDescription
        metadata {
          id
          learnings
          benefits
          targetAudience
          materialsIncluded
          requirements
        }
        video {
          id
          videoURL
          source
          type
          duration
          description
          tags
          width
          height
          format
          createdAt
          updatedAt
        }
        tags
        featuredImage
        price
        discountedPrice
        promotionDuration
        level {
          id
          name
          description
          createdAt
          updatedAt
        }
        duration
        requirements
        status
        creatorID
        topics {
          id
          title
          description
          position
          lessons {
            id
            title
            video {
              id
              videoURL
              source
              type
              duration
              description
              tags
              width
              height
              format
              createdAt
              updatedAt
            }
            showPreview
            featuredImage
            content
            createdAt
            attachments
            position
            updatedAt
            progress {
              id
              completed
              completedAt
              startedAt
            }
          }
          quizzes {
            id
            title
            position
            progress {
              id
              completed
              score
              startedAt
              completedAt
            }
          }
        }
        progress {
          id
          completedLessons
          completedQuizzes
          totalLessons
          totalQuizzes
          totalAssignments
          progressPercentage
          startedAt
          completed
          completedAt
          averageCompletionTime
          averageScore
          createdAt
          updatedAt
        }
        reviews {
          id
          comment
          rating
          likes
          createdAt
          updatedAt
        }
        certificates {
          id
          issuedAt
          template {
            name
            logoUrl
            id
            content
            background
          }
        }
        maxEnrollments
        extraSettings {
          key
          value
        }
        visibility
        scheduledPublishAt
        publishedAt
        createdAt
        updatedAt
        instructors {
          id
          fullName
          email
          isActive
          userName
        }
        prerequisites {
          id
          title
          featuredImage
        }
        isUnlocked
      }
      enrolledAt
      status
    }
  }
`)

export type UserEnrollmentsData = ResultOf<typeof ENROLLMENTS>

export async function getEnrollments(
  request: Request
): Promise<UserEnrollmentsData | null> {
  try {
    return await coursesApiClient(request, ENROLLMENTS, {})
  } catch {
    return null
  }
}

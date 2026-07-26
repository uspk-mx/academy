import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

export const STUDENT_COURSE = graphql(`
  query GetCourse($courseId: ID!) {
    course(id: $courseId) {
      id
      hasAccess
      title
      description
      shortDescription
      instructors {
        id
        fullName
        email
      }
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
      category {
        id
        name
        description
        createdAt
        updatedAt
      }
      creatorID
      creator {
        id
        fullName
        email
      }
      progress {
        id
        updatedAt
        totalQuizzes
        totalLessons
        totalAssignments
        startedAt
        progressPercentage
        createdAt
        completedQuizzes
        completedLessons
        completedAt
        completed
        averageScore
        averageCompletionTime
      }
      topics {
        id
        course {
          id
          title
        }
        title
        description
        position
        lessons {
          id
          title
          position
          featuredImage
          content
          attachments
          video {
            id
            source
            videoURL
            type
            tags
            width
            height
            format
            duration
            description
          }
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
          content
          timer
          timeUnit
          passingGrade
          position
          maxAttempts
          questions {
            id
            media
            mark
            order
            title
            type
            settings {
              questionMark
              questionType
              answerRequired
              showQuestionMark
              randomizeQuestion
              sortableItems
              correctAnswers
              matrixMatches {
                columnA
                columnB
              }
            }
            description
            answerExplanation
          }
          progress {
            id
            completed
            score
            startedAt
            completedAt
          }
        }
        createdAt
        updatedAt
      }
      certificates {
        id
        issuedAt
        template {
          id
          name
          logoUrl
          content
          background
        }
      }
      extraSettings {
        key
        value
      }
      createdAt
      updatedAt
      reviews {
        id
        comment
        rating
        course {
          id
          title
        }
        likes
        createdAt
        updatedAt
      }
    }
  }
`)

export type StudentCourseData = ResultOf<typeof STUDENT_COURSE>
export type StudentCourseVariable = VariablesOf<typeof STUDENT_COURSE>

export async function getStudentCourse({
  request,
  variables,
}: {
  request: Request
  variables: StudentCourseVariable
}): Promise<StudentCourseData> {
  return coursesApiClient(request, STUDENT_COURSE, variables)
}

import { runQuery } from "@academy/courses-api/api-client"
import { graphql, ResultOf, VariablesOf } from "../../graphql"

/** Card-sized projection for the courses list. */
export const ADMIN_COURSES_QUERY = graphql(`
  query AdminCourses(
    $search: String
    $sortBy: String
    $sortOrder: String
    $page: Int
    $limit: Int
  ) {
    instructorCourses(
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
      course {
        id
        title
        slug
        shortDescription
        featuredImage
        price
        discountedPrice
        status
        visibility
        pricingType
        duration
        createdAt
        updatedAt
        publishedAt
        category {
          id
          name
        }
        level {
          id
          name
        }
        instructors {
          id
          fullName
        }
      }
    }
  }
`)

/** Everything the builder screens edit, in one round trip. */
export const ADMIN_COURSE_QUERY = graphql(`
  query AdminCourse($courseId: ID!) {
    course(id: $courseId) {
      id
      title
      slug
      shortDescription
      description
      featuredImage
      tags
      price
      discountedPrice
      promotionDuration
      duration
      requirements
      requirementsList
      status
      visibility
      pricingType
      maxEnrollments
      scheduledPublishAt
      publishedAt
      createdAt
      updatedAt
      category {
        id
        name
      }
      level {
        id
        name
      }
      video {
        id
        videoURL
        source
        type
        duration
      }
      metadata {
        id
        learnings
        learningsList
        benefits
        targetAudience
        materialsIncluded
        requirements
      }
      extraSettings {
        key
        value
      }
      instructors {
        id
        fullName
        email
        profilePicture
      }
      prerequisites {
        id
        title
        featuredImage
      }
    }
  }
`)

/** Topics with their lessons and quizzes — the curriculum tree. */
export const ADMIN_CURRICULUM_QUERY = graphql(`
  query AdminCurriculum($courseId: ID!) {
    topicsByCourseId(courseId: $courseId) {
      id
      title
      description
      position
      createdAt
      updatedAt
      lessons {
        id
        title
        content
        position
        featuredImage
        attachments
        showPreview
        video {
          id
          videoURL
          source
          type
          duration
        }
        practiceBites {
          id
          title
          position
        }
      }
      quizzes {
        id
        title
        content
        timer
        timeUnit
        position
        maxAttempts
        passingGrade
        questions {
          id
          title
          type
          order
          mark
        }
      }
    }
  }
`)

export type AdminCoursesData = ResultOf<typeof ADMIN_COURSES_QUERY>
export type AdminCoursesVariables = VariablesOf<typeof ADMIN_COURSES_QUERY>
export type AdminCourseListItem =
  AdminCoursesData["instructorCourses"]["course"][number]

export type AdminCourseData = ResultOf<typeof ADMIN_COURSE_QUERY>
export type AdminCourse = AdminCourseData["course"]

export type AdminCurriculumData = ResultOf<typeof ADMIN_CURRICULUM_QUERY>
export type AdminTopic = AdminCurriculumData["topicsByCourseId"][number]
export type AdminLesson = NonNullable<AdminTopic["lessons"]>[number]
export type AdminQuiz = NonNullable<AdminTopic["quizzes"]>[number]

export function getAdminCourses(
  request: Request,
  variables: AdminCoursesVariables
) {
  return runQuery(request, ADMIN_COURSES_QUERY, variables)
}

export function getAdminCourse(request: Request, courseId: string) {
  return runQuery(request, ADMIN_COURSE_QUERY, { courseId })
}

export function getAdminCurriculum(request: Request, courseId: string) {
  return runQuery(request, ADMIN_CURRICULUM_QUERY, { courseId })
}

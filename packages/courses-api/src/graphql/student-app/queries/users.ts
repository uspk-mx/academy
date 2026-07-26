import { coursesApiClient } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

export const PROFILE_QUERY = graphql(`
  query GetProfile {
    getProfile {
      customerId
      fullName
      userName
      email
      role
      authProvider
      socialId
      phoneNumber
      isVerified
      profilePicture
      interests
      major
      occupation
      isActive
      stripeId
      updatedAt
      createdAt
      carts {
        id
        subtotal
        tax
        total
        updatedAt
        expiresAt
        createdAt
        items {
          id
          inStock
          cartId
          itemId
          itemType
          notes
          quantity
          unitPrice
          item {
            ... on Course {
              id
              featuredImage
              duration
              discountedPrice
              description
              category {
                id
                name
                description
              }
              level {
                id
                name
                description
              }
              price
              requirements
              status
              title
              tags
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
            }
            ... on CourseBundle {
              id
              price
              title
              subtotalRegularPrice
              updatedAt
              featuredImage
              discountValue
              discountType
              description
              createdAt
              courses {
                id
                title
                price
                description
              }
            }
            ... on SubscriptionPlan {
              id
              planName
              planDescription
              price
              duration
              createdAt
              updatedAt
            }
          }
        }
      }
      subscription {
        id
        user {
          id
          fullName
          email
        }
        plan {
          id
          planName
          planDescription
          price
          duration
          createdAt
          updatedAt
        }
        startDate
        endDate
      }
      courses {
        id
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
      bundles {
        id
        title
        description
        featuredImage
        price
        subtotalRegularPrice
        discountType
        discountValue
        courses {
          id
          title
          description
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
          topics {
            id
            title
            position
            description
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
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      company {
        id
        email
        name
        isActive
        taxId
        taxName
        logo
        icon
        stripeId
        setupIntentClientSecret
        address
      }
    }
  }
`)

export type UserProfileResult = ResultOf<typeof PROFILE_QUERY>

export async function getUserProfile(
  request: Request
): Promise<UserProfileResult | null> {
  try {
    return await coursesApiClient(request, PROFILE_QUERY, {})
  } catch {
    return null
  }
}

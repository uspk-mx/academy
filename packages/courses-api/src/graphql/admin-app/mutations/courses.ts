import { runMutation } from "@academy/courses-api/api-client"
import { graphql, VariablesOf } from "../../graphql"

export const CREATE_INITIAL_COURSE = graphql(`
  mutation CreateInitialCourse($input: CreateInitialCourseInput!) {
    createInitialCourse(input: $input) {
      id
      title
      status
    }
  }
`)

export const UPDATE_COURSE = graphql(`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput) {
    updateCourse(id: $id, input: $input) {
      id
      title
      status
      updatedAt
    }
  }
`)

export const DELETE_COURSE = graphql(`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`)

export const SET_COURSE_PREREQUISITES = graphql(`
  mutation SetCoursePrerequisites($input: SetCoursePrerequisitesInput!) {
    setCoursePrerequisites(input: $input) {
      id
      prerequisites {
        id
        title
      }
    }
  }
`)

export const ASSIGN_INSTRUCTOR = graphql(`
  mutation AssignInstructor($userId: ID!, $courseId: ID!) {
    assignInstructor(userId: $userId, courseId: $courseId) {
      id
      user {
        id
        fullName
      }
    }
  }
`)

export const UNASSIGN_INSTRUCTOR = graphql(`
  mutation UnassignInstructor($userId: ID!, $courseId: ID!) {
    unassignInstructor(userId: $userId, courseId: $courseId)
  }
`)

export function createInitialCourse(
  request: Request,
  variables: VariablesOf<typeof CREATE_INITIAL_COURSE>
) {
  return runMutation(request, CREATE_INITIAL_COURSE, variables)
}

export function updateCourse(
  request: Request,
  variables: VariablesOf<typeof UPDATE_COURSE>
) {
  return runMutation(request, UPDATE_COURSE, variables)
}

export function deleteCourse(
  request: Request,
  variables: VariablesOf<typeof DELETE_COURSE>
) {
  return runMutation(request, DELETE_COURSE, variables)
}

export function setCoursePrerequisites(
  request: Request,
  variables: VariablesOf<typeof SET_COURSE_PREREQUISITES>
) {
  return runMutation(request, SET_COURSE_PREREQUISITES, variables)
}

export function assignInstructor(
  request: Request,
  variables: VariablesOf<typeof ASSIGN_INSTRUCTOR>
) {
  return runMutation(request, ASSIGN_INSTRUCTOR, variables)
}

export function unassignInstructor(
  request: Request,
  variables: VariablesOf<typeof UNASSIGN_INSTRUCTOR>
) {
  return runMutation(request, UNASSIGN_INSTRUCTOR, variables)
}

import { runMutation } from "@academy/courses-api/api-client"
import { graphql, VariablesOf } from "../../graphql"

// --------------------------------------------------------------- bundles

export const CREATE_BUNDLE = graphql(`
  mutation CreateCourseBundle($input: CreateCourseBundleInput!) {
    createCourseBundle(input: $input) {
      id
      title
    }
  }
`)

export const UPDATE_BUNDLE = graphql(`
  mutation UpdateCourseBundle($input: UpdateCourseBundleInput!) {
    updateCourseBundle(input: $input) {
      id
      title
    }
  }
`)

export const DELETE_BUNDLE = graphql(`
  mutation DeleteCourseBundle($id: ID!) {
    deleteCourseBundle(id: $id)
  }
`)

// -------------------------------------------------------- learning paths

export const CREATE_LEARNING_PATH = graphql(`
  mutation CreateLearningPath($input: CreateLearningPathInput!) {
    createLearningPath(input: $input) {
      id
      name
    }
  }
`)

export const UPDATE_LEARNING_PATH = graphql(`
  mutation UpdateLearningPath(
    $learningPathId: ID!
    $input: UpdateLearningPathInput!
  ) {
    updateLearningPath(learningPathId: $learningPathId, input: $input) {
      id
      name
    }
  }
`)

export const DELETE_LEARNING_PATH = graphql(`
  mutation DeleteLearningPath($learningPathId: ID!) {
    deleteLearningPath(learningPathId: $learningPathId) {
      id
    }
  }
`)

// ----------------------------------------------------------- enrollments

export const CREATE_ENROLLMENT = graphql(`
  mutation AdminCreateEnrollment($userId: ID!, $courseId: ID!) {
    createEnrollment(userId: $userId, courseId: $courseId) {
      id
      status
    }
  }
`)

export const UPDATE_ENROLLMENT_STATUS = graphql(`
  mutation UpdateEnrollmentStatus($enrollmentId: ID!, $status: String!) {
    updateEnrollmentStatus(enrollmentId: $enrollmentId, status: $status) {
      id
      status
    }
  }
`)

export const DELETE_ENROLLMENT = graphql(`
  mutation DeleteEnrollment($enrollmentId: ID!) {
    deleteEnrollment(enrollmentId: $enrollmentId)
  }
`)

// ----------------------------------------------------- subscription plans

export const CREATE_PLAN = graphql(`
  mutation CreateSubscriptionPlan($input: CreateSubscriptionPlanInput!) {
    createSubscriptionPlan(input: $input) {
      id
      planName
    }
  }
`)

export const UPDATE_PLAN = graphql(`
  mutation UpdateSubscriptionPlan($input: UpdateSubscriptionPlanInput!) {
    updateSubscriptionPlan(input: $input) {
      id
      planName
    }
  }
`)

export const DELETE_PLAN = graphql(`
  mutation DeleteSubscriptionPlan($id: ID!) {
    deleteSubscriptionPlan(id: $id)
  }
`)

// ------------------------------------------------- certificate templates

export const CREATE_CERTIFICATE_TEMPLATE = graphql(`
  mutation CreateCertificateTemplate($input: CertificateTemplateInput!) {
    createCertificateTemplate(input: $input) {
      id
      name
    }
  }
`)

export const UPDATE_CERTIFICATE_TEMPLATE = graphql(`
  mutation UpdateCertificateTemplate(
    $id: ID!
    $input: UpdateCertificateTemplateInput!
  ) {
    updateCertificateTemplate(id: $id, input: $input) {
      id
      name
    }
  }
`)

export const DELETE_CERTIFICATE_TEMPLATE = graphql(`
  mutation DeleteCertificateTemplate($id: ID!) {
    deleteCertificateTemplate(id: $id)
  }
`)

export function createBundle(
  request: Request,
  variables: VariablesOf<typeof CREATE_BUNDLE>
) {
  return runMutation(request, CREATE_BUNDLE, variables)
}

export function updateBundle(
  request: Request,
  variables: VariablesOf<typeof UPDATE_BUNDLE>
) {
  return runMutation(request, UPDATE_BUNDLE, variables)
}

export function deleteBundle(
  request: Request,
  variables: VariablesOf<typeof DELETE_BUNDLE>
) {
  return runMutation(request, DELETE_BUNDLE, variables)
}

export function createLearningPath(
  request: Request,
  variables: VariablesOf<typeof CREATE_LEARNING_PATH>
) {
  return runMutation(request, CREATE_LEARNING_PATH, variables)
}

export function updateLearningPath(
  request: Request,
  variables: VariablesOf<typeof UPDATE_LEARNING_PATH>
) {
  return runMutation(request, UPDATE_LEARNING_PATH, variables)
}

export function deleteLearningPath(
  request: Request,
  variables: VariablesOf<typeof DELETE_LEARNING_PATH>
) {
  return runMutation(request, DELETE_LEARNING_PATH, variables)
}

export function createEnrollment(
  request: Request,
  variables: VariablesOf<typeof CREATE_ENROLLMENT>
) {
  return runMutation(request, CREATE_ENROLLMENT, variables)
}

export function updateEnrollmentStatus(
  request: Request,
  variables: VariablesOf<typeof UPDATE_ENROLLMENT_STATUS>
) {
  return runMutation(request, UPDATE_ENROLLMENT_STATUS, variables)
}

export function deleteEnrollment(
  request: Request,
  variables: VariablesOf<typeof DELETE_ENROLLMENT>
) {
  return runMutation(request, DELETE_ENROLLMENT, variables)
}

export function createPlan(
  request: Request,
  variables: VariablesOf<typeof CREATE_PLAN>
) {
  return runMutation(request, CREATE_PLAN, variables)
}

export function updatePlan(
  request: Request,
  variables: VariablesOf<typeof UPDATE_PLAN>
) {
  return runMutation(request, UPDATE_PLAN, variables)
}

export function deletePlan(
  request: Request,
  variables: VariablesOf<typeof DELETE_PLAN>
) {
  return runMutation(request, DELETE_PLAN, variables)
}

export function createCertificateTemplate(
  request: Request,
  variables: VariablesOf<typeof CREATE_CERTIFICATE_TEMPLATE>
) {
  return runMutation(request, CREATE_CERTIFICATE_TEMPLATE, variables)
}

export function updateCertificateTemplate(
  request: Request,
  variables: VariablesOf<typeof UPDATE_CERTIFICATE_TEMPLATE>
) {
  return runMutation(request, UPDATE_CERTIFICATE_TEMPLATE, variables)
}

export function deleteCertificateTemplate(
  request: Request,
  variables: VariablesOf<typeof DELETE_CERTIFICATE_TEMPLATE>
) {
  return runMutation(request, DELETE_CERTIFICATE_TEMPLATE, variables)
}

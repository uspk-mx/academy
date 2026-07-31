import { runMutation } from "@academy/courses-api/api-client"
import { graphql, VariablesOf } from "../../graphql"

// ---------------------------------------------------------------- topics

export const CREATE_TOPIC = graphql(`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      title
      position
    }
  }
`)

export const UPDATE_TOPIC = graphql(`
  mutation UpdateTopic($id: ID!, $input: UpdateTopicInput) {
    updateTopic(id: $id, input: $input) {
      id
      title
      description
      position
    }
  }
`)

export const DELETE_TOPIC = graphql(`
  mutation DeleteTopic($id: ID!) {
    deleteTopic(id: $id)
  }
`)

// --------------------------------------------------------------- lessons

export const CREATE_LESSON = graphql(`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
      id
      title
      position
    }
  }
`)

export const UPDATE_LESSON = graphql(`
  mutation UpdateLesson($id: ID!, $input: UpdateLessonInput!) {
    updateLesson(id: $id, input: $input) {
      id
      title
      position
    }
  }
`)

export const DELETE_LESSON = graphql(`
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id)
  }
`)

// --------------------------------------------------------------- quizzes

export const CREATE_QUIZ = graphql(`
  mutation CreateQuiz($input: CreateQuizInput!) {
    createQuiz(input: $input) {
      id
      title
      position
    }
  }
`)

export const UPDATE_QUIZ = graphql(`
  mutation UpdateQuiz($id: ID!, $input: UpdateQuizInput) {
    updateQuiz(id: $id, input: $input) {
      id
      title
      position
    }
  }
`)

export const DELETE_QUIZ = graphql(`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`)

// ------------------------------------------------------------- questions

export const CREATE_QUESTION = graphql(`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      title
      type
      order
    }
  }
`)

export const UPDATE_QUESTION = graphql(`
  mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      title
      type
      order
    }
  }
`)

export const DELETE_QUESTION = graphql(`
  mutation DeleteQuestion($id: ID!) {
    deleteQuestion(id: $id)
  }
`)

// -------------------------------------------------------- practice bites

export const CREATE_PRACTICE_BITE = graphql(`
  mutation CreatePracticeBite($input: CreatePracticeBiteInput!) {
    createPracticeBite(input: $input) {
      id
      title
      position
    }
  }
`)

export const UPDATE_PRACTICE_BITE = graphql(`
  mutation UpdatePracticeBite($id: ID!, $input: UpdatePracticeBiteInput!) {
    updatePracticeBite(id: $id, input: $input) {
      id
      title
      position
    }
  }
`)

export const DELETE_PRACTICE_BITE = graphql(`
  mutation DeletePracticeBite($id: ID!) {
    deletePracticeBite(id: $id)
  }
`)

export const CREATE_PRACTICE_BITE_ITEM = graphql(`
  mutation CreatePracticeBiteItem($input: CreatePracticeBiteItemInput!) {
    createPracticeBiteItem(input: $input) {
      id
      prompt
      position
    }
  }
`)

export const UPDATE_PRACTICE_BITE_ITEM = graphql(`
  mutation UpdatePracticeBiteItem(
    $id: ID!
    $input: UpdatePracticeBiteItemInput!
  ) {
    updatePracticeBiteItem(id: $id, input: $input) {
      id
      prompt
      position
    }
  }
`)

export const DELETE_PRACTICE_BITE_ITEM = graphql(`
  mutation DeletePracticeBiteItem($id: ID!) {
    deletePracticeBiteItem(id: $id)
  }
`)

export function createTopic(
  request: Request,
  variables: VariablesOf<typeof CREATE_TOPIC>
) {
  return runMutation(request, CREATE_TOPIC, variables)
}

export function updateTopic(
  request: Request,
  variables: VariablesOf<typeof UPDATE_TOPIC>
) {
  return runMutation(request, UPDATE_TOPIC, variables)
}

export function deleteTopic(
  request: Request,
  variables: VariablesOf<typeof DELETE_TOPIC>
) {
  return runMutation(request, DELETE_TOPIC, variables)
}

export function createLesson(
  request: Request,
  variables: VariablesOf<typeof CREATE_LESSON>
) {
  return runMutation(request, CREATE_LESSON, variables)
}

export function updateLesson(
  request: Request,
  variables: VariablesOf<typeof UPDATE_LESSON>
) {
  return runMutation(request, UPDATE_LESSON, variables)
}

export function deleteLesson(
  request: Request,
  variables: VariablesOf<typeof DELETE_LESSON>
) {
  return runMutation(request, DELETE_LESSON, variables)
}

export function createQuiz(
  request: Request,
  variables: VariablesOf<typeof CREATE_QUIZ>
) {
  return runMutation(request, CREATE_QUIZ, variables)
}

export function updateQuiz(
  request: Request,
  variables: VariablesOf<typeof UPDATE_QUIZ>
) {
  return runMutation(request, UPDATE_QUIZ, variables)
}

export function deleteQuiz(
  request: Request,
  variables: VariablesOf<typeof DELETE_QUIZ>
) {
  return runMutation(request, DELETE_QUIZ, variables)
}

export function createQuestion(
  request: Request,
  variables: VariablesOf<typeof CREATE_QUESTION>
) {
  return runMutation(request, CREATE_QUESTION, variables)
}

export function updateQuestion(
  request: Request,
  variables: VariablesOf<typeof UPDATE_QUESTION>
) {
  return runMutation(request, UPDATE_QUESTION, variables)
}

export function deleteQuestion(
  request: Request,
  variables: VariablesOf<typeof DELETE_QUESTION>
) {
  return runMutation(request, DELETE_QUESTION, variables)
}

export function createPracticeBite(
  request: Request,
  variables: VariablesOf<typeof CREATE_PRACTICE_BITE>
) {
  return runMutation(request, CREATE_PRACTICE_BITE, variables)
}

export function updatePracticeBite(
  request: Request,
  variables: VariablesOf<typeof UPDATE_PRACTICE_BITE>
) {
  return runMutation(request, UPDATE_PRACTICE_BITE, variables)
}

export function deletePracticeBite(
  request: Request,
  variables: VariablesOf<typeof DELETE_PRACTICE_BITE>
) {
  return runMutation(request, DELETE_PRACTICE_BITE, variables)
}

export function createPracticeBiteItem(
  request: Request,
  variables: VariablesOf<typeof CREATE_PRACTICE_BITE_ITEM>
) {
  return runMutation(request, CREATE_PRACTICE_BITE_ITEM, variables)
}

export function updatePracticeBiteItem(
  request: Request,
  variables: VariablesOf<typeof UPDATE_PRACTICE_BITE_ITEM>
) {
  return runMutation(request, UPDATE_PRACTICE_BITE_ITEM, variables)
}

export function deletePracticeBiteItem(
  request: Request,
  variables: VariablesOf<typeof DELETE_PRACTICE_BITE_ITEM>
) {
  return runMutation(request, DELETE_PRACTICE_BITE_ITEM, variables)
}

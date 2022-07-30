import { faker } from '@faker-js/faker'

import { createRecommendationWithSomeScore } from './recommendationFactory'


export async function createScenarioWithSomeRecommendations(quantity: number) {
  const scenario = []

  for (let i = 0; i < quantity; i++) {
    const recomendation = await createRecommendationWithSomeScore(
      faker.datatype.number({ min: -4, max: 20 })
    )
    scenario.push(recomendation)
  }

  return scenario
}

export async function createScenarioWithOneRecommendationScore5() {
  const recommendation = await createRecommendationWithSomeScore(5)

  return {
    recommendation
  }
}

export async function createScenarionWithOneRecomendationScore100() {
  const recommendation = await createRecommendationWithSomeScore(100)

  return {
    recommendation
  }
}

export async function createScenarioWithOneRecommendationScore5Negative() {
  const recommendation = await createRecommendationWithSomeScore(-5)

  return {
    recommendation
  }
}
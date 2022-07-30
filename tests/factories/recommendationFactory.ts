import { faker } from "@faker-js/faker"

import { prisma } from '../../src/database'

export async function createRecommendationData() {
  const recommendationData = {
    name: faker.lorem.words(3),
    youtubeLink: "https://www.youtube.com/watch?v=8SbUC-UaAxE",
  }

  return recommendationData
}

export async function createRecommendationWithSomeScore(score: number) {
  const recommendationData = await createRecommendationData();
  const recommendation = await prisma.recommendation.create({
    data: { ...recommendationData, score: score }
  })
  return recommendation
}
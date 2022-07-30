import  { jest } from '@jest/globals'
import { faker } from '@faker-js/faker'

import { recommendationService } from '../../src/services/recommendationsService'
import { recommendationRepository } from '../../src/repositories/recommendationRepository'


describe('Recommendation', () => {
  it('should create recommendation', async () => {
    const recommendation = {
      name: faker.lorem.words(4),
      youtubeLink: "https://www.youtube.com/watch?v=U0d0xpjCjWo",
    }
    jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(null)
    jest.spyOn(recommendationRepository, "create").mockResolvedValueOnce()
    await recommendationService.insert(recommendation)
    expect(recommendationRepository.create).toBeCalledTimes(1)
  })

  it('should throw a conflict error if the name of the recommendation is not unique', async() => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=U0d0xpjCjWo"
    }

    jest.spyOn(recommendationRepository, "findByName")
    .mockResolvedValueOnce({ id: 1, ...recommendation, score: 0 })
    expect(recommendationService.insert(recommendation)).rejects.toEqual({
      type: "conflict",
      message: "recommendations names must be unique"
    })
  })
})
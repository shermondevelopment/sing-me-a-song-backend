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
      message: "Recommendations names must be unique"
    })
  })

  describe('upvote recommendation', () => {
    it('should add 1 point to recommendation score', async () => {
      const recommendation = {
        id: 1,
        name: faker.lorem.words(3),
        youtubeLink: "https://www.youtube.com/watch?v=U0d0xpjCjWo",
        score: 5
      }
      jest.spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce(recommendation)
      jest.spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce({ ...recommendation, score: 6 })

      await recommendationService.upvote(recommendation.id)
      expect(recommendationRepository.updateScore).toBeCalledTimes(1)
    })

    it('should fail add 1 point to recommendation score if id doesn\'t exist', async () => {
      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null)
      expect(recommendationService.upvote(100)).rejects.toEqual({
        type: 'not_found',
        message: ''
      })
    })
  })

  describe("downvote recommendation", () => {
    it("should fail add 1 point to recommendation score if id doesn't exist", async () =>{
      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null)
      expect(recommendationService.upvote(100)).rejects.toEqual({
        type: 'not_found',
        message: ''
      })
    })
    
  })

  describe("downvote recommendation", () => {
    it("should remove 1 point to recommendation and delete recommendation if score bellow -5", async () => {
      const recommendation = {
        id: 1,
        name: faker.lorem.words(3),
        youtubeLink: 'https://www.youtube.com/watch?v=U0d0xpjCjWo',
        score: -5,
      }

      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation)
      jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce({ ...recommendation, score: -6 })
      jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce()

      await recommendationService.downvote(recommendation.id)
      expect(recommendationRepository.remove).toBeCalledTimes(1)
    })
  })

})
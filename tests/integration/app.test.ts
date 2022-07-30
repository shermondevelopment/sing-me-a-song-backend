import { faker } from "@faker-js/faker";
import supertest from "supertest";

import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import { createRecommendationData } from "../factories/recommendationFactory.js";
import {
  createScenarioWithOneRecommendationScore5,
  createScenarioWithOneRecommendationScore5Negative,
  createScenarioWithSomeRecommendations,
} from "../factories/scenarioFactory.js";

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("post new recommendation", () => {
  it("given valid schema, post new recommendation", async () => {
    const recommendationData = await createRecommendationData();
    const response = await supertest(app)
      .post("/recommendations")
      .send(recommendationData);

    expect(response.status).toBe(201);

    const savedRecommendation = await prisma.recommendation.findFirst({
      where: { name: recommendationData.name },
    });

    expect(recommendationData.name).toBe(savedRecommendation.name);
  });

  it("given same name, returns 409", async () => {
    const recommendationData = await createRecommendationData();
    await supertest(app).post("/recommendations").send(recommendationData);
    const response = await supertest(app)
      .post("/recommendations")
      .send(recommendationData);

    expect(response.status).toBe(409);
  });

  it("given wrong schema, return 422", async () => {
    const recommendationData = await createRecommendationData();
    delete recommendationData.name;
    const response = await supertest(app)
      .post("/recommendations")
      .send(recommendationData);

    expect(response.status).toBe(422);
  });
});

describe("upvote recommendation", () => {
  it("add point to recommendation", async () => {
    const { recommendation } =
      await createScenarioWithOneRecommendationScore5();
    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/upvote`
    );

    expect(response.status).toBe(200);

    const savedRecommendation = await prisma.recommendation.findFirst({
      where: { name: recommendation.name },
    });

    expect(savedRecommendation.score).toBe(6);
  });

  it("given invalid id, should return 404", async () => {
    const response = await supertest(app).post(`/recommendations/1/upvote`);

    expect(response.status).toBe(404);
  });
});

describe("downvote recommendation", () => {
  it("remove point from recommendation", async () => {
    const { recommendation } =
      await createScenarioWithOneRecommendationScore5();
    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/downvote`
    );

    expect(response.status).toBe(200);

    const savedRecommendation = await prisma.recommendation.findFirst({
      where: { name: recommendation.name },
    });

    expect(savedRecommendation.score).toBe(4);
  });

  it("given invalid id, should return 404", async () => {
    const response = await supertest(app).post(`/recommendations/1/downvote`);

    expect(response.status).toBe(404);
  });

  it("remove point and delete recommendation with score bellow -5", async () => {
    const { recommendation } =
      await createScenarioWithOneRecommendationScore5Negative();
    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/downvote`
    );

    expect(response.status).toBe(200);

    const savedRecommendation = await prisma.recommendation.findFirst({
      where: { name: recommendation.name },
    });

    expect(savedRecommendation).toBeNull();
  });
});

describe("get recommendations", () => {
  it("get last 10 recommendatios", async () => {
    const scenario = await createScenarioWithSomeRecommendations(11);
    const response = await supertest(app).get(`/recommendations/`);

    expect(response.body.length).toBe(10);
    expect(response.body[0].id).toEqual(scenario[10].id);
    expect(response.body[9].id).toEqual(scenario[1].id);
  });

  it("get recommendation by id", async () => {
    const scenario = await createScenarioWithSomeRecommendations(1);
    const response = await supertest(app).get(
      `/recommendations/${scenario[0].id}`
    );

    expect(response.body.id).toBe(scenario[0].id);
  });

  it("given invalid id, returns 404", async () => {
    const response = await supertest(app).get(`/recommendations/1`);

    expect(response.status).toBe(404);
  });

  it("get random recommendation", async () => {
    const scenario = await createScenarioWithSomeRecommendations(10);

    const response = await supertest(app).get(`/recommendations/random`);

    expect(response.body).toHaveProperty("name");
  });

  it("get random with no recommendations register, should return 404", async () => {
    const response = await supertest(app).get(`/recommendations/random`);

    expect(response.status).toBe(404);
  });

  it("get top 3 recommendations", async () => {
    const scenario = await createScenarioWithSomeRecommendations(6);
    const response = await supertest(app).get(`/recommendations/top/3`);

    expect(response.body.length).toBe(3);
    expect(response.body[0].score).toBeGreaterThanOrEqual(
      response.body[1].score
    );
    expect(response.body[1].score).toBeGreaterThanOrEqual(
      response.body[2].score
    );
  });
});

afterAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  await prisma.$disconnect();
});
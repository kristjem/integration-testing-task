const express = require("express");
const {router: usersRouter, userService} = require("./routes/users");
const request = require("supertest");

const app = express();
app.use(express.json()); // To parse JSON request bodies (populate req.body)
app.use("/users", usersRouter);

describe("testing-server-routes", () => {
  const newUser = {
    username: "carl.greyhound",
    password: "dog!password",
    score: 10
  };

  const newUserMissingPassword = {
    username: "carl.greyhound",
    score: 10
  };

  beforeAll(() => {
    // Mocking db.User.findAll to return the below test data to the route handler
    jest.spyOn(userService, "getAll").mockResolvedValue([
      { id: 1, username: "frank", password: "password123", score: 5 },
      { id: 2, username: "mandy", password: "password123", score: 4 },
      { id: 3, username: "howard", password: "password123", score: 6 },
      { id: 5, username: "peppapig", password: "password123", score: 6 }
    ]);


    // Mocking db.User.create to return the new user
    jest.spyOn(userService, "create").mockResolvedValue({
      id: 123, // any number, represents autoincremented PK returned by the db
      ...newUser // unpack the newUser object
    });

  });

  afterAll(async () => {
    jest.restoreAllMocks(); // Restore original implementation
    await userService.client.close();
  });

  test("GET /users - success", async () => {
    const { body } = await request(app).get("/users");
    expect(body).toEqual({
      "success": true,
      "data": [
        {
          "id": 1,
          "username": "frank",
          "password": "password123",
          "score": 5
        },
        {
          "id": 2,
          "username": "mandy",
          "password": "password123",
          "score": 4
        },
        {
          "id": 3,
          "username": "howard",
          "password": "password123",
          "score": 6
        },
        {
          "id": 5,
          "username": "peppapig",
          "password": "password123",
          "score": 6
        }
      ]
    });
  });

  test("GET /users/:username - success", async () => {
    jest.spyOn(userService, "getOneByUsername").mockResolvedValue({
      id: 123, // any number, represents autoincremented PK returned by the db
      ...newUser // unpack the newUser object
    });
    const { body, status } = await request(app)
      .get(`/users/${newUser.username}`);

    expect(status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: {
        id: expect.any(Number), // represents autoincremented PK returned by the db
        ...newUser // unpack the newUser object
      }
    });
  });

  test("POST /users - success", async () => {
    jest.spyOn(userService, "getOneByUsername").mockResolvedValue(undefined);
    const { body, status } = await request(app)
      .post("/users")
      .send(newUser);

    expect(status).toBe(201);
    expect(body).toEqual({
      success: true,
      data: {
        id: expect.any(Number), // represents autoincremented PK returned by the db
        ...newUser // unpack the newUser object
      }
    });
  });

  test("POST /users - missing password", async () => {
    jest.spyOn(userService, "getOneByUsername").mockResolvedValue(undefined);
    const { body, status } = await request(app)
      .post("/users")
      .send(newUserMissingPassword);

    expect(status).toBe(400);
    expect(body).toEqual({
      success: false,
      message: "username, password and score are required."
    });
  });

  test("POST /users - unexpected error from service", async () => {
    // Mock userService.create to throw a generic error
    jest.spyOn(userService, "create").mockRejectedValue(new Error("Database down"));

    const { body, status } = await request(app)
      .post("/users")
      .send(newUser);

    expect(status).toBe(500);
    expect(body).toEqual({
      success: false,
      message: "Something threw a wrench into the CPU fan... That was unexpected."
    });
  });

  test("DELETE /users/:username - success", async () => {
    jest.spyOn(userService, "deleteOneByUsername").mockResolvedValue({
      "success": true,
      "message": "User deleted successfully."
    }); // Mocking successful deletion

    const { body, status } = await request(app)
      .delete(`/users/${newUser.username}`);

    expect(status).toBe(200);
    expect(body).toEqual({
      success: true,
      message: "User deleted successfully."
    });
  });

  test("DELETE /users/:username - user not found", async () => {
    // Sequelize returns 0 (not null or undefined) if no rows were deleted
    jest.spyOn(userService, "deleteOneByUsername").mockResolvedValue(0); // Mocking user not found

    const { body, status } = await request(app)
      .delete(`/users/${newUser.username}`);

    expect(status).toBe(404);
    expect(body).toEqual({
      success: false,
      message: "User not found."
    });
  });

  test("DELETE /users/:username - unexpected error from service", async () => {
    // Mock userService.deleteOneByUsername to throw a generic error
    jest.spyOn(userService, "deleteOneByUsername").mockRejectedValue(new Error("Database down"));

    const { body, status } = await request(app)
      .delete(`/users/${newUser.username}`);

    expect(status).toBe(500);
    expect(body).toEqual({
      success: false,
      message: "Something threw a wrench into the CPU fan... That was unexpected."
    });
  });

  test("DELETE /users - missing username route parameter", async () => {
    const { body, status } = await request(app)
      .delete("/users/");

    expect(status).toBe(404);
    // Body will be HTML formatted
  });
});


// We should close the Sequelize connection after all tests are done.
afterAll(async () => {
  await userService.client.close();
});
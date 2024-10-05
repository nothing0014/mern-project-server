const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index"); // Your express app
const User = require("../models").user;
const jwt = require("jsonwebtoken");
const { expect } = chai;

// Configure chai to use chai-http for making HTTP requests
chai.use(chaiHttp);

describe("Auth Routes", () => {
  before(async () => {
    // Before running tests, clean up the User collection to avoid duplicate user issues
    await User.deleteMany({ email: /@example\.com$/ });
  });

  describe("GET api/user/testAPI", () => {
    it("should return success message", (done) => {
      chai
        .request(app)
        .get("/api/user/testAPI")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal("成功連結auth route");
          done();
        });
    });
  });

  describe("POST register", () => {
    it("should register a new student user", (done) => {
      chai
        .request(app)
        .post("/api/user/register")
        .send({
          email: "student@example.com",
          username: "student",
          password: "password123",
          role: "student",
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("msg").eql("使用者已被儲存。");
          expect(res.body.savedUser).to.have.property(
            "email",
            "student@example.com"
          );
          done();
        });
    });

    it("should register a new instructor user", (done) => {
      chai
        .request(app)
        .post("/api/user/register")
        .send({
          email: "instructor@example.com",
          username: "instructor",
          password: "password123",
          role: "instructor",
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("msg").eql("使用者已被儲存。");
          expect(res.body.savedUser).to.have.property(
            "email",
            "instructor@example.com"
          );
          done();
        });
    });

    it("should not register a user with an existing email", (done) => {
      chai
        .request(app)
        .post("/api/user/register")
        .send({
          email: "student@example.com", // Same email as before
          username: "anotheruser",
          password: "password123",
          role: "student",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.text).to.equal("信箱已經被註冊過了。");
          done();
        });
    });
    it("should not register a user with an invalid email", (done) => {
      chai
        .request(app)
        .post("/api/user/register")
        .send({
          email: "invalidemail.com", // 不合法的信箱格式
          username: "testuser",
          password: "password123",
          role: "student",
        })
        .end((err, res) => {
          expect(res).to.have.status(400); // 應返回 400 錯誤
          expect(res.text).to.include("email"); // 應有 email 錯誤信息
          done();
        });
    });
    it("should not register a user with an empty password", (done) => {
      chai
        .request(app)
        .post("/api/user/register")
        .send({
          email: "testuser@example.com", // 合法的信箱格式
          username: "testuser",
          password: "", // 空密碼
          role: "student",
        })
        .end((err, res) => {
          expect(res).to.have.status(400); // 應返回 400 錯誤
          expect(res.text).to.include("password"); // 應有 password 錯誤信息
          done();
        });
    });
  });

  describe("POST login", () => {
    it("should login with valid credentials", (done) => {
      chai
        .request(app)
        .post("/api/user/login")
        .send({
          email: "student@example.com",
          password: "password123",
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("msg").eql("成功登入");
          expect(res.body).to.have.property("token");
          done();
        });
    });

    it("should not login with invalid credentials", (done) => {
      chai
        .request(app)
        .post("/api/user/login")
        .send({
          email: "student@example.com",
          password: "wrongpassword",
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.text).to.equal("密碼錯誤");
          done();
        });
    });

    it("should not login with non-existing email", (done) => {
      chai
        .request(app)
        .post("/api/user/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.text).to.equal("此信箱未被註冊過");
          done();
        });
    });
  });
});

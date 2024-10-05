const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index"); // Express app
const { expect } = chai;

chai.use(chaiHttp);

let instructorToken = ""; // 將保存身分為老師的 JWT 的變數
let instructorID = ""; //保存老師ID
let studentToken = ""; //將保存身分為學生的 JWT的變數
let studentID = ""; //保存學生ID

describe("Course Routes with JWT Authentication", () => {
  // 在所有測試之前，先註冊並登入以獲取 JWT
  before((done) => {
    chai
      .request(app)
      .post("/api/user/login")
      .send({
        email: "student@example.com", // 用一個有效的帳號進行測試
        password: "password123", // 對應帳號的密碼
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
        studentToken = res.body.token; // 保存 JWT
        studentID = res.body.user._id;
        done();
      });
  });

  // 測試獲取所有課程
  describe("GET /api/courses", () => {
    it("should return all courses if authenticated", (done) => {
      chai
        .request(app)
        .get("/api/courses")
        .set("Authorization", studentToken) // 使用 JWT 認證
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message").eql("以下為課程列表");
          expect(res.body).to.have.property("foundCourses");
          done();
        });
    });

    it("should return 401 if no token is provided", (done) => {
      chai
        .request(app)
        .get("/api/courses")
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  // 測試以學生 ID 獲取課程
  describe("GET /api/courses/student/:_student_id", () => {
    it("should return courses for a specific student", (done) => {
      chai
        .request(app)
        .get(`/api/courses/student/${studentID}`) // 用一個測試學生ID
        .set("Authorization", studentToken) // 使用 JWT 認證
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message").eql("以下為課程列表");
          done();
        });
    });
  });

  // 測試以學生 ID 獲取課程
  describe("GET /api/courses/student/:_student_id", () => {
    it("should return empty courses list for a non exists student", (done) => {
      chai
        .request(app)
        .get(`/api/courses/student/12345`) // 用一個測試學生ID
        .set("Authorization", studentToken) // 使用 JWT 認證
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message").eql("以下為課程列表");
          expect(res.body.foundCourses).to.be.an("array").that.is.empty;
          done();
        });
    });
  });

  // 測試新增課程
  describe("POST /api/courses", () => {
    it("should not allow students to create a course", (done) => {
      chai
        .request(app)
        .post("/api/courses")
        .set("Authorization", studentToken) // 使用 JWT 認證
        .send({
          title: "New Course",
          description: "Course description",
          price: 100,
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.text).to.equal(
            "只有講師才能發布新課程。若你已經是講師，請透過講師帳號登入。"
          );
          done();
        });
    });
  });
});

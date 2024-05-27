import express from "express";
import expressSession from "express-session";
import expressMySQLSession from "express-mysql-session";
import dotEnv from "dotenv";
import UsersRouter from "./routes/users.router.js";
import errorHandlingMiddleware from "./middlewares/error-handling.middleware.js";

dotEnv.config();

const app = express();
const PORT = 3020;

const MySQLStorage = expressMySQLSession(expressSession);
const sessionStore = new MySQLStorage({
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  expiration: 1000 * 60 * 60 * 24,
  createDatabaseTable: true,
});

app.use(express.json());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use("/api", UsersRouter);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});

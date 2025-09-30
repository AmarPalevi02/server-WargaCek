require("dotenv").config();
const port = process.env.PORT;
const { NotFoudn } = require("./src/errors");

const session = require("express-session");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");

const app = express();

const allowedOrigins = [
  `${process.env.PORT_PWA}`,
  `${process.env.PORT_WEB}`,
  `${process.env.PORT_INSTITUT}`,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(logger("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(
  session({
    secret: `${process.env.CAPTCHA_SECRET}`,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

const errorHendelerMiddlewares = require("./src/errors/hendler-error");

// route all
const authRouters = require("./src/routes/authroute");
const adminRoutes = require("./src/routes/adminroute");
const userRoutes = require("./src/routes/userroute");
const dinasRoutes = require("./src/routes/dinasroute");

app.get("/", (req, res) => {
  res.send("testing");
});

// version
const version = "/dev-wrgck-v1";

app.use(version, authRouters);
app.use(version, adminRoutes);
app.use(version, userRoutes);
app.use(version, dinasRoutes);

app.use(errorHendelerMiddlewares);
app.use(NotFoudn);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

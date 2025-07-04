const express = require("express");
const { check } = require("express-validator");
const feedController = require("../Controller/feed");
const isAuth = require("../middleware/is-auth")
;
const router = express.Router();



router.get("/posts",isAuth, feedController.getPosts);
router.post(
  "/create", 
  [
    check("title").trim().isLength({ min: 5 }),
    check("content").trim().isLength({ min: 7 }),
  ],
  isAuth,
  feedController.createpost
);

router.get("/post/:postId",isAuth, feedController.getPost);
router.put(
  "/post/:postId",isAuth,
  [
    check("title").trim().isLength({ min: 5 }),
    check("content").trim().isLength({ min: 7 }),
  ],
  feedController.updatePost
);
router.delete("/post/:postId",isAuth,feedController.deletePost)
module.exports = router;

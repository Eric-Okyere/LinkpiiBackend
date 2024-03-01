const express = require('express');

const router = express.Router();
const {
  createUser,
  userSignIn,
  getUsers,
  deleteUser,
  userCodeCount
} = require('../controllers/CodeUsers');




router.get("/",getUsers)
router.get("/getUsers/count", userCodeCount)
router.delete("/:id",deleteUser)
router.post('/create-user', createUser);
router.post('/sign-in', userSignIn);


module.exports = router;

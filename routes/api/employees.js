const express = require("express");
const router = express.Router();
const employeesController = require("../../controllers/employeesController.js");
// const verifyJWT = require('../../middleware/verifyJWT.js');
const ROLES_LIST = ('../../config/roles_list.js');
const verifyRoles = require('../../middleware/verifyRoles.js');

router
  .route("/")
  .get( employeesController.getAllEmployees)
  .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), employeesController.createNewEmployee)
  .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), employeesController.updateEmployee)
  .delete(verifyRoles(ROLES_LIST.Admin), employeesController.deleteEmployee); // Admin can delete the data

router.route("/:id").get(employeesController.getEmployee);

module.exports = router;
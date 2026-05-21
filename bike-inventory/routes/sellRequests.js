const router = require("express").Router();
const { upload } = require("../middleware/upload");
const { createSellRequest } = require("../controllers/sellRequestController");

router.post("/", upload.array("images", 5), createSellRequest);

module.exports = router;

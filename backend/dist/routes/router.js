"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/users", (req, res) => {
    const userData = [
        {
            id: 1,
            name: "Leanna Graham",
        },
    ];
    res.send(userData);
});
router.get("/random", (req, res) => {
    const info = [
        {
            value: "Let's see if this request works!"
        }
    ];
    res.send(info);
});
exports.default = router;
//# sourceMappingURL=router.js.map
import express from "express";
const router = express.Router();

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
})

export default router;

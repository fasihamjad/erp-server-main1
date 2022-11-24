exports.testFunc = async (req, res) => {
  try {
    res.status(200).send({success: true, message: 'HELLO WORLDjjj!'})
  }
  catch (err) {
    res.status(400).json({ data: "Invalid Username/Password" })
  }
}
module.exports = async function (req, res) {
  return res.status(200).json({
    envKeyExists: !!process.env.GROQ_API_KEY,
    keyPreview: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 6) : "NOT FOUND"
  });
};

export default async function handler(req, res) {
  const { testId } = req.query;
  console.log(
    `[${new Date().toISOString()}] simple-put-test-handler.js received. Method: ${
      req.method
    }, testId: ${testId}`
  );
  console.log("Full req.query object:", req.query);

  if (req.method === "OPTIONS") {
    console.log(
      `simple-put-test-handler.js: Responding to OPTIONS request for testId: ${testId}`
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method === "PUT") {
    console.log(
      `simple-put-test-handler.js: Processing PUT request for testId: ${testId}. Body:`,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: `PUT received for testId: ${testId}`,
      body: req.body,
    });
  }

  console.log(
    `simple-put-test-handler.js: Method ${req.method} not allowed for testId: ${testId}. Responding with 405.`
  );
  res.setHeader("Allow", ["PUT", "OPTIONS"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

const { query } = require("./otc");

describe("query", () => {
  it("should get results", async () => {
    let result = await query({ coinId: 2 });
    console.log(result);
    expect(result).toBeDefined();
  });
});

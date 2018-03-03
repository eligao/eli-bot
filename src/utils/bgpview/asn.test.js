const asnQuery = require('./asn');

describe('query', () => {
  it('should get correct results', async () => {
    result = await asnQuery(6939);
    console.log(result);
    expect(result.asn).toBe(6939);
  });
});
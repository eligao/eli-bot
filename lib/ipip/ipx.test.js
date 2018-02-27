const ipx = require('./ipx');
ipx.load('data/17monipdb.datx');

describe('query', () => {
  it('should get results', () => {
    result = ipx.findSync('1.2.4.8');
    // console.log(result);
    expect(result).toBeDefined();
  });
});
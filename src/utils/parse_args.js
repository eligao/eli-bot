function args(ctx, next) {
  let text = ctx.update.message.text;
  let args = text.trim().split(/\s+/);
  ctx.state.args = args;
  next();
}

module.exports = args;

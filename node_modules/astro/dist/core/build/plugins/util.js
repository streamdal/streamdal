function extendManualChunks(outputOptions, hooks) {
  const manualChunks = outputOptions.manualChunks;
  outputOptions.manualChunks = function(id, meta) {
    if (hooks.before) {
      let value = hooks.before(id, meta);
      if (value) {
        return value;
      }
    }
    if (typeof manualChunks == "object") {
      if (id in manualChunks) {
        let value = manualChunks[id];
        return value[0];
      }
    } else if (typeof manualChunks === "function") {
      const outid = manualChunks.call(this, id, meta);
      if (outid) {
        return outid;
      }
    }
    if (hooks.after) {
      return hooks.after(id, meta) || null;
    }
    return null;
  };
}
export {
  extendManualChunks
};
